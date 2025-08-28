import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Lightbulb, Home } from 'lucide-react';

const DotsAndBoxes = ({ level = 1, onLevelComplete, onBack }) => {
  const getGridSize = (levelNum) => {
    if (levelNum <= 10) return { rows: 3, cols: 3 };
    if (levelNum <= 25) return { rows: 4, cols: 4 };
    return { rows: 5, cols: 5 };
  };

  const [gameState, setGameState] = useState(() => {
    const { rows, cols } = getGridSize(level);
    return {
      rows,
      cols,
      horizontalLines: Array(rows + 1).fill(null).map(() => Array(cols).fill(false)),
      verticalLines: Array(rows).fill(null).map(() => Array(cols + 1).fill(false)),
      boxes: Array(rows).fill(null).map(() => Array(cols).fill(0)), // 0: empty, 1: player1, 2: player2
      playerTurn: 1, // 1 or 2
      score: { 1: 0, 2: 0 },
      moves: 0,
      gameOver: false,
      completed: false,
      hint: false,
    };
  });

  const checkCompletedBoxes = (newHorizontalLines, newVerticalLines, player) => {
    let newBoxes = gameState.boxes.map(row => [...row]);
    let boxesScored = 0;

    for (let r = 0; r < gameState.rows; r++) {
      for (let c = 0; c < gameState.cols; c++) {
        if (newBoxes[r][c] === 0) { // Only check uncompleted boxes
          const top = newHorizontalLines[r][c];
          const bottom = newHorizontalLines[r + 1][c];
          const left = newVerticalLines[r][c];
          const right = newVerticalLines[r][c + 1];

          if (top && bottom && left && right) {
            newBoxes[r][c] = player;
            boxesScored++;
          }
        }
      }
    }
    return { newBoxes, boxesScored };
  };

  const handleLineClick = (type, row, col) => {
    if (gameState.gameOver || gameState.completed) return;

    setGameState(prev => {
      let newHorizontalLines = prev.horizontalLines.map(r => [...r]);
      let newVerticalLines = prev.verticalLines.map(r => [...r]);
      let newPlayerTurn = prev.playerTurn;
      let newScore = { ...prev.score };
      let newMoves = prev.moves + 1;

      let linePlaced = false;

      if (type === 'horizontal' && !newHorizontalLines[row][col]) {
        newHorizontalLines[row][col] = true;
        linePlaced = true;
      } else if (type === 'vertical' && !newVerticalLines[row][col]) {
        newVerticalLines[row][col] = true;
        linePlaced = true;
      }

      if (!linePlaced) return prev; // Line already exists

      const { newBoxes, boxesScored } = checkCompletedBoxes(newHorizontalLines, newVerticalLines, prev.playerTurn);

      if (boxesScored > 0) {
        newScore[prev.playerTurn] += boxesScored;
        // Player gets another turn if they scored a box
      } else {
        newPlayerTurn = prev.playerTurn === 1 ? 2 : 1;
      }

      const totalBoxes = prev.rows * prev.cols;
      const totalScore = newScore[1] + newScore[2];
      const completed = totalScore === totalBoxes;

      if (completed) {
        setTimeout(() => onLevelComplete(), 1500);
      }

      return {
        ...prev,
        horizontalLines: newHorizontalLines,
        verticalLines: newVerticalLines,
        boxes: newBoxes,
        playerTurn: newPlayerTurn,
        score: newScore,
        moves: newMoves,
        gameOver: completed,
        completed,
      };
    });
  };

  const resetGame = () => {
    const { rows, cols } = getGridSize(level);
    setGameState({
      rows,
      cols,
      horizontalLines: Array(rows + 1).fill(null).map(() => Array(cols).fill(false)),
      verticalLines: Array(rows).fill(null).map(() => Array(cols + 1).fill(false)),
      boxes: Array(rows).fill(null).map(() => Array(cols).fill(0)),
      playerTurn: 1,
      score: { 1: 0, 2: 0 },
      moves: 0,
      gameOver: false,
      completed: false,
      hint: false,
    });
  };

  const showHint = () => {
    setGameState(prev => ({ ...prev, hint: !prev.hint }));
  };

  const getBoxColor = (player) => {
    if (player === 1) return 'bg-blue-500';
    if (player === 2) return 'bg-red-500';
    return 'bg-gray-200';
  };

  const getLineColor = (player) => {
    if (player === 1) return 'bg-blue-600';
    if (player === 2) return 'bg-red-600';
    return 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-700 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">⚫ Dots and Boxes</h1>
            <p className="text-purple-200">Level {level} - {gameState.rows}x{gameState.cols} Grid</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={showHint} variant="outline" size="sm" className="text-white border-white hover:bg-yellow-500">
              <Lightbulb className="w-4 h-4" />
            </Button>
            <Button onClick={resetGame} variant="outline" size="sm" className="text-white border-white hover:bg-blue-500">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="text-center mb-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-6 text-white">
              <div>
                <p className="text-lg font-semibold">Player 1: {gameState.score[1]}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Player 2: {gameState.score[2]}</p>
              </div>
            </div>
            <p className="text-purple-200 text-sm mt-2">
              {gameState.hint ? "💡 Complete a box to get another turn!" : `Player ${gameState.playerTurn}'s Turn`}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
            {Array(gameState.rows).fill(null).map((_, r) => (
              <div key={r} className="flex flex-col">
                {/* Horizontal lines between dots */}
                <div className="flex">
                  {Array(gameState.cols).fill(null).map((_, c) => (
                    <React.Fragment key={c}>
                      <div className="w-2 h-2 bg-white rounded-full"></div> {/* Dot */}
                      <div
                        className={`h-2 flex-grow mx-1 cursor-pointer ${gameState.horizontalLines[r][c] ? getLineColor(gameState.boxes[r][c] || gameState.playerTurn) : 'bg-gray-400 hover:bg-gray-300'}`}
                        onClick={() => handleLineClick('horizontal', r, c)}
                      ></div>
                    </React.Fragment>
                  ))}
                  <div className="w-2 h-2 bg-white rounded-full"></div> {/* Last Dot in row */}
                </div>

                {/* Vertical lines and boxes */}
                <div className="flex">
                  {Array(gameState.cols).fill(null).map((_, c) => (
                    <React.Fragment key={c}>
                      <div
                        className={`w-2 flex-grow my-1 cursor-pointer ${gameState.verticalLines[r][c] ? getLineColor(gameState.boxes[r][c] || gameState.playerTurn) : 'bg-gray-400 hover:bg-gray-300'}`}
                        onClick={() => handleLineClick('vertical', r, c)}
                      ></div>
                      <div className={`w-8 h-8 flex items-center justify-center ${getBoxColor(gameState.boxes[r][c])}`}>
                        {gameState.boxes[r][c] !== 0 && <span className="text-white text-xl font-bold">P{gameState.boxes[r][c]}</span>}
                      </div>
                    </React.Fragment>
                  ))}
                  <div
                    className={`w-2 flex-grow my-1 cursor-pointer ${gameState.verticalLines[r][gameState.cols] ? getLineColor(gameState.boxes[r][gameState.cols-1] || gameState.playerTurn) : 'bg-gray-400 hover:bg-gray-300'}`}
                    onClick={() => handleLineClick('vertical', r, gameState.cols)}
                  ></div>
                </div>
              </div>
            ))}
            {/* Last row of horizontal lines */}
            <div className="flex">
              {Array(gameState.cols).fill(null).map((_, c) => (
                <React.Fragment key={c}>
                  <div className="w-2 h-2 bg-white rounded-full"></div> {/* Dot */}
                  <div
                    className={`h-2 flex-grow mx-1 cursor-pointer ${gameState.horizontalLines[gameState.rows][c] ? getLineColor(gameState.boxes[gameState.rows-1][c] || gameState.playerTurn) : 'bg-gray-400 hover:bg-gray-300'}`}
                    onClick={() => handleLineClick('horizontal', gameState.rows, c)}
                  ></div>
                </React.Fragment>
              ))}
              <div className="w-2 h-2 bg-white rounded-full"></div> {/* Last Dot in row */}
            </div>
          </div>
        </div>

        {/* Game Over / Win Message */}
        {gameState.gameOver && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <p className="text-lg">
                {gameState.score[1] > gameState.score[2] ? 'Player 1 Wins!' : gameState.score[2] > gameState.score[1] ? 'Player 2 Wins!' : 'It\'s a Tie!'}
              </p>
              <Button onClick={resetGame} className="mt-4 bg-white text-gray-800 hover:bg-gray-100">
                Play Again
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-purple-200 text-sm">
              Players take turns drawing a single line between two adjacent dots. When a player draws the fourth side of a box, they claim that box and get another turn. The player with the most boxes at the end wins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DotsAndBoxes;


