package main

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/shirou/gopsutil/v3/process"
)

type TrackedProcess struct {
	Name         string `json:"name"`
	DisplayName  string `json:"displayName"`
	MinutesOn    int    `json:"minutesOn"`
	UpdateAt     string `json:"updateAt"`
	StillRunning bool   `json:"stillRunning"`
}

var DATABASE_PATH = strings.Replace(os.Getenv("APPDATA")+`\GoForHours`+`\goForHours.db`, `\`, `/`, -1)

func main() {
	var database, _ = sql.Open("sqlite3", DATABASE_PATH)

	rows, _ := database.Query("SELECT * FROM tracked_processes")

	var trackedProcesses []TrackedProcess

	for rows.Next() {
		var tracked TrackedProcess

		rows.Scan(&tracked.Name, &tracked.DisplayName, &tracked.MinutesOn, &tracked.UpdateAt, &tracked.StillRunning)

		trackedProcesses = append(trackedProcesses, tracked)
	}

	processes, _ := process.Processes()

	for _, trackedProc := range trackedProcesses {
		found := false
		for _, proc := range processes {
			var name, _ = proc.Name()
			if trackedProc.Name == name {
				found = true
				break
			}
		}

		UpdateTrackedProcess(database, trackedProc.Name, found)
	}

}

func UpdateTrackedProcess(database *sql.DB, name string, stillRunning bool) {
	var err error

	if stillRunning {
		statement, _ := database.Prepare("UPDATE tracked_processes SET minuteson = minuteson + 1, stillrunning = ?, updatedat = ? WHERE name = ?")
		_, err = statement.Exec(stillRunning, time.Now().Local().String(), name)
	} else {
		statement, _ := database.Prepare("UPDATE tracked_processes SET stillrunning = ? WHERE name = ?")
		_, err = statement.Exec(stillRunning, name)
	}

	if err != nil {
		fmt.Println(err.Error())
	}
}
