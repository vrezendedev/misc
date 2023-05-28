import { useState, useEffect } from 'react';
import { GetProcesses, VerifyProcessesState } from '../wailsjs/go/procs/Procs';
import { procs } from '../wailsjs/go/models';

import ProcessCard from './ProcessCard';

import './style.css';
import gopher from './../public/gopher.png';

function App() {
    const [processes, setProcesses] = useState<Array<procs.BaseProcess>>(
        new Array<procs.BaseProcess>()
    );
    const [filter, setFilter] = useState<string>('');

    async function GetRunningProcesses() {
        await GetProcesses(processes).then((result) => {
            setProcesses(result);
        });
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
                            onClick={async () => await GetRunningProcesses()}
                        >
                            Refresh All Processes Running!
                        </button>
                        <button
                            className="buttons"
                            onClick={async () => await VerifyRunningState()}
                        >
                            Force Process State Tracking!
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
                                    procName={obj.displayName}
                                    image={gopher}
                                    stillRunning={obj.ended ? false : true}
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
