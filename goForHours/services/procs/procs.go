package procs

import (
	"context"
	"fmt"
	"log"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/shirou/gopsutil/v3/process"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type Procs struct {
	ctx context.Context
}

type BaseProcess struct {
	PID         int32     `json:"pID"`
	Name        string    `json:"name"`
	DisplayName string    `json:"displayName"`
	StartAt     time.Time `json:"startAt"`
	EndAt       time.Time `json:"endAt"`
	Ended       bool      `json:"ended"`
}

func NewProcs() *Procs {
	return &Procs{}
}

func (p *Procs) SetContext(ctx context.Context) {
	p.ctx = ctx
}

func (bp BaseProcess) ToString() string {
	return fmt.Sprintf(" PID: %s \n Name: %s \n Display Name: %s \n Start At: %s \n End At: %s \n Ended: %t ", strconv.Itoa(int(bp.PID)), bp.Name, bp.DisplayName, bp.StartAt, bp.EndAt, bp.Ended)
}

func (p *Procs) GetProcesses(procsTracked []BaseProcess) []BaseProcess {
	processes, err := process.Processes()

	if err != nil {
		log.Fatal(err)
	}

	var newProcsTracked = procsTracked

	for _, proc := range processes {

		pid := proc.Pid
		name, _ := proc.Name()
		startAt, _ := proc.CreateTime()

		if len(name) > 0 {
			add := true

			for _, procTracked := range procsTracked {
				if procTracked.Name == name {
					add = false
				}
			}

			for _, newProc := range newProcsTracked {
				if newProc.Name == name {
					add = false
				}
			}

			if add {
				var newProcTracked BaseProcess

				newProcTracked.PID = pid
				newProcTracked.Name = name
				newProcTracked.DisplayName = p.FormatProcessDisplayName(name)
				newProcTracked.StartAt = time.UnixMilli(int64(startAt))
				newProcTracked.Ended = false

				newProcsTracked = append(newProcsTracked, newProcTracked)
			}
		}
	}

	sort.Slice(newProcsTracked, func(i, j int) bool {
		return newProcsTracked[i].DisplayName[0] < newProcsTracked[j].DisplayName[0]
	})

	return p.VerifyProcessesState(newProcsTracked)
}

func (p *Procs) VerifyProcessesState(procsTracked []BaseProcess) []BaseProcess {
	processes, err := process.Processes()

	if err != nil {
		log.Fatal(err)
	}

	var newProcsTracked = procsTracked

	for index, procTracked := range newProcsTracked {
		found := false

		for index, proc := range processes {
			name, _ := proc.Name()

			if len(name) > 0 {
				if procTracked.Name == name {
					found = true
					break
				}

				if index == len(processes)-1 && !found {
					found = false
				}
			}
		}

		nullableTime := time.Time{}

		if !found && nullableTime.Equal(newProcsTracked[index].EndAt) {
			newProcsTracked[index].EndAt = time.Now()
			newProcsTracked[index].Ended = true
		} else if found {
			newProcsTracked[index].EndAt = time.Time{}
			newProcsTracked[index].Ended = false
		}
	}

	return newProcsTracked
}

func (p *Procs) FormatProcessDisplayName(name string) string {
	name = strings.Replace(name, "_", " ", -1)
	name = strings.Replace(name, ".exe", "", -1)
	name = cases.Title(language.AmericanEnglish).String(name)

	var displayName string
	var previousChar rune

	for index, char := range name {

		if unicode.IsUpper(char) && unicode.IsLetter(char) && !unicode.IsUpper(previousChar) && !unicode.IsSpace(previousChar) && index != 0 {
			displayName += " "
		}
		displayName += string(char)
		previousChar = char
	}

	return displayName
}
