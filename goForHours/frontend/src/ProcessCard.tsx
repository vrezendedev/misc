import { useEffect, useState } from 'react';
import {
    InsertNewTrackedProcess,
    GetTrackedProcessImage,
} from '../wailsjs/go/procsDal/ProcsDal';
import { procs, procsDal } from '../wailsjs/go/models';

import './style.css';
import gopher from './gopher.png';

interface processInfo extends procs.BaseProcess {
    refresh: Function;
}

function ProcessCard({
    name,
    displayName,
    startAt,
    endAt,
    ended,
    refresh,
}: processInfo) {
    const [image, setImage] = useState<string | null>(null);
    const [trackedMessage, setTrackedMessage] = useState('');

    async function Track() {
        let tracked = new procsDal.TrackedProcess();
        tracked.displayName = displayName;
        tracked.name = name;
        tracked.stillRunning = ended ? false : true;

        let success: boolean = await InsertNewTrackedProcess(tracked);

        if (success) setTrackedMessage('Successfully tracking!');
        else setTrackedMessage('Failed/already tracking!');

        setTimeout(() => {
            setTrackedMessage('');
            refresh();
        }, 1500);
    }

    useEffect(() => {
        const getImage = async () => {
            setImage(
                await GetTrackedProcessImage(name).then((res) =>
                    res.image != '' ? res.image : null
                )
            );
        };
        getImage();
    }, []);

    return (
        <div className="card">
            <div className="card-image-div">
                {image != '' ? (
                    <img
                        src={
                            image != null
                                ? `data:image/png;base64,${image}`
                                : gopher
                        }
                        className="card-image"
                    />
                ) : (
                    ''
                )}
            </div>
            <div className="card-text">
                <p>{displayName}</p>
                <p className="card-text-medium">
                    Currently running? {ended ? '❌' : '✅'}
                </p>
                <p className="card-text-small">
                    Started at:{' '}
                    {(startAt as string).replace('T', ' ').substring(0, 19)}
                </p>
                <p className="card-text-small">
                    Stopped at:{' '}
                    {endAt != '0001-01-01T00:00:00Z'
                        ? (endAt as string).replace('T', ' ').substring(0, 19)
                        : ''}
                </p>
                <button
                    className="buttons"
                    onClick={async () => {
                        Track();
                    }}
                    style={{
                        width: '170px',
                        height: '25px',
                        margin: '0',
                        padding: '0',
                    }}
                >
                    {trackedMessage == '' ? 'Track! 🚀' : trackedMessage}
                </button>
            </div>
        </div>
    );
}

export default ProcessCard;
