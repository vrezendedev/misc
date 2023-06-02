import { useState, useEffect } from 'react';
import { GetAllTrackedProcess } from '../wailsjs/go/procsDal/ProcsDal';
import { GetProcesses, VerifyProcessesState } from '../wailsjs/go/procs/Procs';

import { procs, procsDal } from '../wailsjs/go/models';

import ProcessCard from './ProcessCard';

import './style.css';
import gopher from './gopher.png';

function App() {
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
                        (element) => element.displayName == obj.displayName
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
                    <div style={{ marginRight: '40px' }}>
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
                                    image={gopher}
                                    convertValues={() => {}}
                                    key={obj.displayName}
                                />
                            );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div id="App">
            <div>
                <div className="running-processes">
                    {DisplayRunningProcesses()}
                </div>
            </div>
        </div>
    );
}

export default App;
