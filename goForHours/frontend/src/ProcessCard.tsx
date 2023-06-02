import './style.css';
import { InsertNewTrackedProcess } from '../wailsjs/go/procsDal/ProcsDal';
import { procs, procsDal } from '../wailsjs/go/models';
import { useState } from 'react';

interface processInfo extends procs.BaseProcess {
    image: string | null;
    refresh: Function;
}

function ProcessCard({
    image,
    name,
    displayName,
    startAt,
    endAt,
    ended,
    refresh,
}: processInfo) {
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

    return (
        <div className="card">
            <div className="card-image-div">
                {image != null ? (
                    <img src={image} className="card-image" />
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
