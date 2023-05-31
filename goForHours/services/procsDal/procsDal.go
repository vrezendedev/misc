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
	Name         string `json:"name"`
	DisplayName  string `json:"displayName"`
	MinutesOn    int    `json:"minutesOn"`
	UpdateAt     string `json:"updateAt"`
	StillRunning bool   `json:"stillRunning"`
}

type ProcsDal struct {
	ctx          context.Context
	DATABASE_CTX *sql.DB
}

var DATABASE_PATH = strings.Replace(os.Getenv("APPDATA")+`\GoForHours`+`\goForHours.db`, `\`, `/`, -1)

func NewProcsDal() *ProcsDal {
	return &ProcsDal{}
}

func (p *ProcsDal) SetContext(ctx context.Context) {
	p.ctx = ctx
	p.CreateOrLoadDatabase()
	p.OpenDatabase()
}

func (p *ProcsDal) OpenDatabase() {
	p.DATABASE_CTX, _ = sql.Open("sqlite3", DATABASE_PATH)
}

func (p *ProcsDal) CloseDatabase() {
	p.DATABASE_CTX.Close()
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
	database, err := sql.Open("sqlite3", folderPlusFile)

	if err == nil {
		statement, _ := database.Prepare("CREATE TABLE IF NOT EXISTS tracked_processes (name text, displayName text primary key, minutesOn UNSIGNED BIG INT, updatedAt text, stillRunning boolean)")
		statement.Exec()
	}

	database.Close()
}

func (p *ProcsDal) InsertNewTrackedProcess(tracked TrackedProcess) bool {

	tracked.UpdateAt = time.Now().Local().String()
	tracked.MinutesOn = 0

	statement, _ := p.DATABASE_CTX.Prepare("INSERT INTO tracked_processes (name, displayName, minutesOn, updatedAt, stillRunning) VALUES (?, ?, ?, ?, ?)")
	_, err := statement.Exec(tracked.Name, tracked.DisplayName, tracked.MinutesOn, tracked.UpdateAt, tracked.StillRunning)

	if err != nil {
		return false
	} else {
		return true
	}

}

func (p *ProcsDal) GetAllTrackedProcess() []TrackedProcess {
	rows, _ := p.DATABASE_CTX.Query("SELECT * FROM tracked_processes")

	var trackedProcesses []TrackedProcess

	for rows.Next() {
		var tracked TrackedProcess

		rows.Scan(&tracked.Name, &tracked.DisplayName, &tracked.MinutesOn, &tracked.UpdateAt, &tracked.StillRunning)

		trackedProcesses = append(trackedProcesses, tracked)
	}

	return trackedProcesses
}
