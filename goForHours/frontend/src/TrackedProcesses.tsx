import { useState, useEffect, EventHandler } from 'react';

import {
    GetAllTrackedProcess,
    GetTrackedProcessImage,
    InsertOrUpdateNewTrackedProcessImage,
    StopTrackingProcess,
    UpdateTrackedProcessName,
} from '../wailsjs/go/procsDal/ProcsDal';

import { procsDal } from '../wailsjs/go/models';

import './style.css';
import gopher from './gopher.png';

type TrackedProcessesComplete = procsDal.TrackedProcess & {
    image: string;
};

const reader = new FileReader();
let procImageName = '';

reader.onloadend = async () => {
    let success = await InsertOrUpdateNewTrackedProcessImage(
        procImageName,
        (reader.result as string).replace('data:image/png;base64,', '')
    );
    if (success) {
        setTimeout(() => {
            procImageName = '';
        }, 3000);
    }
};

function TrackedProcesses() {
    const [trackedProcessesComplete, setTrackedProcessesComplete] = useState<
        Array<TrackedProcessesComplete>
    >([]);
    const [filter, setFilter] = useState<string>('');
    const [changeNameTarget, setChangeNameTarget] = useState('');

    async function GetAlreadyTrackedComplete() {
        var trackedProcesses = await GetAllTrackedProcess();

        if (trackedProcesses == null) {
            setTrackedProcessesComplete(new Array<TrackedProcessesComplete>());
            return;
        }

        let trackedProcessesWithImage: Array<TrackedProcessesComplete> =
            await Promise.all(
                trackedProcesses.map(async (element) => {
                    var trackedImage = await GetTrackedProcessImage(
                        element.name
                    );
                    return {
                        ...element,
                        image: trackedImage.image,
                    };
                })
            );

        setTrackedProcessesComplete(trackedProcessesWithImage);
    }

    useEffect(() => {
        GetAlreadyTrackedComplete();
    }, []);

    useEffect(() => {
        const intervalID = setInterval(() => {
            if (changeNameTarget == '') GetAlreadyTrackedComplete();
        }, 3000);

        return () => {
            clearInterval(intervalID);
        };
    }, [trackedProcessesComplete]);

    function DisplayTrackedProcesses() {
        return (
            <div>
                {trackedProcessesComplete.map((obj) => {
                    if (
                        filter == '' ||
                        obj.displayName
                            .toLowerCase()
                            .includes(filter.toLowerCase())
                    )
                        return (
                            <div
                                key={obj.name}
                                className="tracked-proc"
                                style={{
                                    background: obj.stillRunning
                                        ? 'linear-gradient(90deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.08) 9%, rgba(0, 0, 0, 0.3) 25%)'
                                        : 'linear-gradient(90deg, rgba(255, 0, 0, 0.1) 0%, rgba(255, 0, 0, 0.08) 9%, rgba(0, 0, 0, 0.3) 25%)',
                                }}
                            >
                                <img
                                    className="tracked-proc-image"
                                    src={
                                        obj.image != ''
                                            ? `data:image/png;base64,${obj.image}`
                                            : gopher
                                    }
                                />
                                <div className="tracked-proc-info">
                                    <input
                                        type="text"
                                        defaultValue={obj.displayName}
                                        disabled={
                                            !(obj.name == changeNameTarget)
                                        }
                                        onKeyDown={async (element) => {
                                            if (element.key == 'Enter') {
                                                await UpdateTrackedProcessName(
                                                    element.currentTarget.value,
                                                    obj.name
                                                );
                                                setChangeNameTarget('');
                                                setTimeout(() => {
                                                    GetAlreadyTrackedComplete();
                                                }, 1000);
                                            }
                                        }}
                                        onBlur={async (element) => {
                                            await UpdateTrackedProcessName(
                                                element.currentTarget.value,
                                                obj.name
                                            );
                                            setChangeNameTarget('');
                                            setTimeout(() => {
                                                GetAlreadyTrackedComplete();
                                            }, 1000);
                                        }}
                                        maxLength={20}
                                        className="title-card"
                                        style={{
                                            backgroundColor:
                                                obj.name == changeNameTarget
                                                    ? 'rgba(0, 0, 0, 0.5)'
                                                    : 'transparent',
                                            border:
                                                obj.name == changeNameTarget
                                                    ? 'solid rgba(255, 255, 255, 0.5) 1px 15px'
                                                    : 'none',
                                        }}
                                    ></input>
                                    {obj.minutesOn > 60 ? (
                                        <p>
                                            ⏰ {Math.floor(obj.minutesOn / 60)}{' '}
                                            hours and {obj.minutesOn % 60}{' '}
                                            minutes!
                                        </p>
                                    ) : (
                                        <p>⏰ {obj.minutesOn % 60} minutes!</p>
                                    )}
                                    <p>
                                        {obj.stillRunning
                                            ? '⚡ Current Running!'
                                            : `🛑 Last Session at: ${obj.updateAt
                                                  .toString()
                                                  .replace('T', ' ')
                                                  .substring(0, 16)}`}
                                    </p>
                                </div>
                                <div className="card-options">
                                    <button
                                        className="buttons"
                                        style={{ margin: 0, height: '35px' }}
                                        onClick={() =>
                                            setChangeNameTarget(obj.name)
                                        }
                                    >
                                        🧰 Change Name!
                                    </button>

                                    <button
                                        className="buttons"
                                        style={{
                                            margin: 0,
                                            marginTop: '10px',
                                            height: '35px',
                                        }}
                                        onClick={() => {
                                            let doc =
                                                document.createElement('input');
                                            doc.type = 'file';
                                            doc.accept = 'image/png';
                                            doc.hidden = true;
                                            doc.click();
                                            doc.onchange = () => {
                                                let file = doc.files;
                                                if (file != null) {
                                                    reader.readAsDataURL(
                                                        file[0]
                                                    );
                                                    procImageName = obj.name;
                                                }
                                                setTimeout(() => {
                                                    GetAlreadyTrackedComplete();
                                                }, 1000);
                                            };
                                        }}
                                    >
                                        {procImageName.includes(obj.name)
                                            ? `${obj.name} .png uploaded!`
                                            : '🎨 Change Image!'}
                                    </button>
                                    <button
                                        className="buttons"
                                        style={{
                                            margin: 0,
                                            marginTop: '10px',
                                            height: '35px',
                                        }}
                                        onClick={async () => {
                                            await StopTrackingProcess(obj.name);
                                            setTimeout(() => {
                                                GetAlreadyTrackedComplete();
                                            }, 1000);
                                        }}
                                    >
                                        💔 Stop Tracking!
                                    </button>
                                </div>
                            </div>
                        );
                })}
            </div>
        );
    }

    return (
        <div className="tracked-processes">
            <div className="tracked-div">
                <div style={{ width: '674px', marginTop: '5px' }}>
                    <p className="title">Tracked Softwares (Processes)</p>
                    <img
                        src={gopher}
                        className="gopher-pic"
                        style={{ transform: 'scaleY(1) scaleX(1)', top: '1%' }}
                    ></img>
                </div>
                <div
                    style={{
                        width: '600px',
                        textAlign: 'center',
                        marginTop: '15px',
                        marginBottom: '15px',
                    }}
                >
                    <label className="label-text-input">Filter by Name: </label>
                    <input
                        className="text-input"
                        onChange={(obj) => setFilter(obj.target.value)}
                    ></input>
                </div>
                <div>{DisplayTrackedProcesses()}</div>
            </div>
        </div>
    );
}

export default TrackedProcesses;
