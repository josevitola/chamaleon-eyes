import { useCallback, useState } from "react";
import { EyeBoard } from "../../components/EyeBoard"
import { Eye } from "../../classes/Eye";

const CANVAS_WIDTH = 1000,
    CANVAS_HEIGHT = 500;

const Home = () => {
    const [animation, setAnimation] = useState(true);
    const [eyes, setEyes] = useState<Eye[]>([]);

    const addToEyes = useCallback((newEye: Eye) => {
        setEyes([...eyes, newEye]);
    }, [eyes])

    const resetEyes = useCallback(() => {
        setEyes([])
    }, [])

    return (
        <>
            <EyeBoard
                animated={animation}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                eyes={eyes}
                addToEyes={addToEyes}
            />

            <h1>Camaleones</h1>
            <div style={{ display: 'flex' }}>
                <button onClick={() => setAnimation(!animation)}>
                    animation is {animation ? "on" : "off"}
                </button>
                <button onClick={resetEyes}>
                    reset
                </button>
            </div>
        </>
    )
}

export default Home