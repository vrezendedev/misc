import { useState, useEffect } from 'react';
import { GetProcesses, VerifyProcessesState } from '../wailsjs/go/procs/Procs';
import { procs } from '../wailsjs/go/models';

function App() {
    const [processes, setProcesses] = useState<Array<procs.BaseProcess> | null>(
        null
    );

    async function GetRunningProcesses(): Promise<Array<procs.BaseProcess>> {
        return await GetProcesses(new Array<procs.BaseProcess>()).then(
            (result) => {
                return result;
            }
        );
    }

    useEffect(() => {
        const fetchProcesses = async () =>
            setProcesses(await GetRunningProcesses());
        fetchProcesses();
    }, []);

    function DisplayRunningProcesses() {
        console.log(processes);
        return (
            <div>
                {processes?.map((obj) => {
                    return (
                        <div key={obj.displayName}>
                            <li>
                                {obj.displayName} | {obj.startAt} |{' '}
                                {obj.ended ? 'true' : 'false'}
                            </li>
                        </div>
                    );
                })}
            </div>
        );
    }

    return <div id="App">{DisplayRunningProcesses()}</div>;
}

export default App;
