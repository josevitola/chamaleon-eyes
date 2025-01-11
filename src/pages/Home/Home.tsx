import { useCallback, useState } from 'react';
import { EyeBoard } from '../../components/EyeBoard';
import { Eye } from '../../classes/Eye';
import './Home.css';

const CANVAS_WIDTH = 1000,
  CANVAS_HEIGHT = 500;

const Home = () => {
  const [animation, setAnimation] = useState(true);
  const [debug, setDebug] = useState(true);
  const [eyes, setEyes] = useState<Eye[]>([]);

  const addToEyes = useCallback(
    (newEye: Eye) => {
      setEyes([...eyes, newEye]);
    },
    [eyes],
  );

  const toggleAnimation = useCallback(() => {
    setAnimation(!animation)
  }, [animation]);

  const toggleDebug = useCallback(() => {
    setDebug(!debug)
  }, [debug]);

  const resetEyes = useCallback(() => {
    setEyes([]);
  }, []);

  return (
    <>
      <EyeBoard
        animated={animation}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        eyes={eyes}
        debug={debug}
        addToEyes={addToEyes}
      />

      <h1>Camaleones</h1>
      <div className="center">
        <div className="buttons">
          <button onClick={toggleAnimation}>
            animation is {animation ? 'on' : 'off'}
          </button>
          <button onClick={toggleDebug}>debug is {debug ? 'on' : 'off'}</button>
          <button onClick={resetEyes}>reset</button>
        </div>
      </div>
    </>
  );
};

export default Home;
