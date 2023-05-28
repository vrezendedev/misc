import './style.css';

type processInfo = {
    image: string | null;
    procName: string;
    stillRunning: boolean;
};

function ProcessCard({ image, procName, stillRunning }: processInfo) {
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
                <p>{procName}</p>
                <p>Currently running? {stillRunning ? '✅' : '❌'}</p>
                <button
                    className="buttons"
                    style={{
                        width: '170px',
                        height: '25px',
                        margin: '0',
                        padding: '0',
                    }}
                >
                    Track! 🚀
                </button>
            </div>
        </div>
    );
}

export default ProcessCard;
