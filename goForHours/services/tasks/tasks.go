package tasks

import (
	"os"
	"os/user"
	"path/filepath"
	"time"

	"github.com/capnspacehook/taskmaster"
	"github.com/google/glazier/go/tasks"
	"github.com/rickb777/date/period"
)

func VerifyAndCreateTask() {
	exists, _ := tasks.TaskExists("goForHoursTracker")

	if exists {
		return
	}

	ex, err := os.Executable()
	if err != nil {
		panic(err)
	}
	exPath := "\"" + filepath.Dir(ex) + "\\goForHoursTracker.exe" + "\""

	us, _ := user.Current()

	var _ = tasks.Create("goForHoursTracker", exPath, "", "goForHoursTracker", us.Username, taskmaster.TimeTrigger{
		TaskTrigger: taskmaster.TaskTrigger{
			Enabled:       true,
			ID:            "startup",
			StartBoundary: time.Now(), RepetitionPattern: taskmaster.RepetitionPattern{
				RepetitionInterval: period.New(0, 0, 0, 0, 0, 60),
				RepetitionDuration: period.NewYMD(0, 0, 3256),
				StopAtDurationEnd:  false,
			},
		},
	})
}
