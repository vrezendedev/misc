import { useState, useEffect } from 'react';
import {
    GetAllTrackedProcess,
    GetTrackedProcessImage,
} from '../wailsjs/go/procsDal/ProcsDal';
import { GetProcesses, VerifyProcessesState } from '../wailsjs/go/procs/Procs';

import { procs, procsDal } from '../wailsjs/go/models';

import ProcessCard from './ProcessCard';

import './style.css';
import gopher from './gopher.png';

function App() {
    const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
    const [timerTick, setTimerTick] = useState<number>(5);
    const [processes, setProcesses] = useState<Array<procs.BaseProcess>>(
        new Array<procs.BaseProcess>()
    );
    const [filter, setFilter] = useState<string>('');

    async function GetRunningProcesses() {
        await GetProcesses(processes).then(async (result) => {
            let alreadyTracked = await GetTrackedProcesses();

            if (alreadyTracked != null) {
                result = result.filter((obj) => {
                    let found = alreadyTracked.some(
                        (element) => element.name == obj.name
                    );
                    return found ? null : obj;
                });
            }
            setProcesses(result);
        });
    }

    async function GetTrackedProcesses(): Promise<
        Array<procsDal.TrackedProcess>
    > {
        return await GetAllTrackedProcess();
    }

    async function VerifyRunningState() {
        let state = await VerifyProcessesState(processes).then((result) => {
            return result;
        });

        let changed = processes.map((obj) =>
            state.map((objState) => {
                if (objState.name == obj.name) {
                    return objState.ended != obj.ended;
                }
            })
        );

        if (changed) {
            setProcesses(state);
        }
    }

    useEffect(() => {
        GetRunningProcesses();
    }, []);

    useEffect(() => {
        const intervalID = setInterval(() => {
            if (autoRefresh) {
                GetRunningProcesses();
            }
        }, 5000);

        const intervalIDTimer = setInterval(() => {
            setTimerTick((oldVal) => oldVal - 1);
        }, 1000);

        return () => {
            setTimerTick(5);
            clearInterval(intervalID);
            clearInterval(intervalIDTimer);
        };
    }, [processes, autoRefresh]);

    function DisplayRunningProcesses() {
        return (
            <div className="cards-div">
                <div id="search-and-more">
                    <p className="title">Search and Track</p>
                    <img src={gopher} className="gopher-pic"></img>
                    <div style={{ marginTop: '10px', marginRight: '40px' }}>
                        <label className="label-text-input">
                            Filter by Name:{' '}
                        </label>
                        <input
                            className="text-input"
                            onChange={(obj) => setFilter(obj.target.value)}
                        ></input>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            left: '-2.8%',
                        }}
                    >
                        <button
                            className="buttons"
                            onClick={async () => {
                                await GetRunningProcesses();
                            }}
                        >
                            Add New and Refresh Processes State!
                        </button>
                        <button
                            className="buttons"
                            onClick={async () => await VerifyRunningState()}
                        >
                            Force Refresh State from Processes List!
                        </button>
                        <button
                            style={{ whiteSpace: 'pre-line' }}
                            className="buttons"
                            onClick={() => setAutoRefresh((val) => !val)}
                        >
                            {autoRefresh
                                ? `Refresh in ${timerTick} s \n (Click here to disable!)`
                                : 'Click and enable auto refresh!'}
                        </button>
                    </div>
                </div>
                <div id="tracked-processes">
                    {processes?.map((obj) => {
                        if (
                            filter == '' ||
                            obj.displayName
                                .toLowerCase()
                                .includes(filter.toLowerCase())
                        )
                            return (
                                <ProcessCard
                                    {...obj}
                                    refresh={GetRunningProcesses}
                                    convertValues={() => {}}
                                    key={obj.displayName}
                                />
                            );
                    })}
                </div>
            </div>
        );
    }

    return <div className="running-processes">{DisplayRunningProcesses()}</div>;
}

export default App;
