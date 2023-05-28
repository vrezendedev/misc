package procsDal

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type TrackedProcess struct {
	Name         string    `json:"name"`
	DisplayName  string    `json:"displayName"`
	MinutesOn    int       `json:"minutesOn"`
	UpdateAt     time.Time `json:"updateAt"`
	StillRunning bool      `json:"stillRunning"`
}

type ProcsDal struct {
	ctx context.Context
}

func NewProcsDal() *ProcsDal {
	return &ProcsDal{}
}

func (p *ProcsDal) SetContext(ctx context.Context) {
	p.ctx = ctx
	p.CreateOrLoadDatabase()
}

func (p *ProcsDal) CreateOrLoadDatabase() {
	var folderPath = os.Getenv("APPDATA")

	var folder = folderPath + `\GoForHours`
	var folderPlusFile = folder + `\goForHours.db`

	var _, err = os.ReadDir(folder)

	if err != nil {
		_ = os.Mkdir(folder, os.ModeAppend)
	}

	_, err = os.ReadFile(folderPlusFile)

	if err != nil {
		fmt.Println(err.Error())
		os.Create(folderPlusFile)
	}

	folderPlusFile = strings.Replace(folderPlusFile, `\`, `/`, -1)
	var database, _ = sql.Open("sqlite3", folderPlusFile)

	if database != nil {
		statement, _ := database.Prepare("CREATE TABLE IF NOT EXISTS tracked_processes (name text, displayName text primary key, minutesOn UNSIGNED BIG INT, updatedAt text, stillRunning boolean)")
		statement.Exec()
	}
}
