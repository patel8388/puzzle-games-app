import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { RotateCcw, Lightbulb, Home } from 'lucide-react'

const Minesweeper = ({ level = 1, onLevelComplete, onBack }) => {
  const getGridSize = (levelNum) => {
    if (levelNum <= 10) return { rows: 9, cols: 9, mines: 10 }
    if (levelNum <= 25) return { rows: 16, cols: 16, mines: 40 }
    return { rows: 16, cols: 30, mines: 99 }
  }

  const [gameState, setGameState] = useState(() => {
    const { rows, cols, mines } = getGridSize(level)
    return {
      grid: [],
      rows,
      cols,
      mines,
      flags: mines,
      gameOver: false,
      win: false,
      startTime: null,
      elapsedTime: 0,
      intervalId: null,
      hint: false,
    }
  })

  const createEmptyGrid = (rows, cols) => {
    return Array(rows).fill(null).map(() => Array(cols).fill({
      value: 0, // 0-8 for numbers, -1 for mine
      revealed: false,
      flagged: false,
    }))
  }

  const placeMines = (grid, rows, cols, mines, startRow, startCol) => {
    let minesPlaced = 0
    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows)
      const c = Math.floor(Math.random() * cols)

      // Ensure mine is not placed on the starting click or its immediate neighbors
      if (grid[r][c].value !== -1 && !(Math.abs(r - startRow) <= 1 && Math.abs(c - startCol) <= 1)) {
        grid[r][c] = { ...grid[r][c], value: -1 }
        minesPlaced++
      }
    }
    return grid
  }

  const calculateNumbers = (grid, rows, cols) => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].value === -1) continue

        let mineCount = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const nr = r + dr
            const nc = c + dc

            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].value === -1) {
              mineCount++
            }
          }
        }
        grid[r][c] = { ...grid[r][c], value: mineCount }
      }
    }
    return grid
  }

  const initializeGame = (startRow, startCol) => {
    let newGrid = createEmptyGrid(gameState.rows, gameState.cols)
    newGrid = placeMines(newGrid, gameState.rows, gameState.cols, gameState.mines, startRow, startCol)
    newGrid = calculateNumbers(newGrid, gameState.rows, gameState.cols)
    
    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      startTime: Date.now(),
      intervalId: setInterval(() => {
        setGameState(p => ({ ...p, elapsedTime: Math.floor((Date.now() - p.startTime) / 1000) }))
      }, 1000)
    }))
    revealCell(startRow, startCol, newGrid)
  }

  const revealCell = (row, col, currentGrid) => {
    if (row < 0 || row >= gameState.rows || col < 0 || col >= gameState.cols) return
    const cell = currentGrid[row][col]
    if (cell.revealed || cell.flagged) return

    currentGrid[row][col] = { ...cell, revealed: true }

    if (cell.value === -1) {
      // Game Over
      clearInterval(gameState.intervalId)
      setGameState(prev => ({ ...prev, gameOver: true, win: false, grid: currentGrid }))
      return
    }

    if (cell.value === 0) {
      // Recursively reveal neighbors if value is 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          revealCell(row + dr, col + dc, currentGrid)
        }
      }
    }
    setGameState(prev => ({ ...prev, grid: currentGrid }))
    checkWinCondition(currentGrid)
  }

  const handleCellClick = (row, col) => {
    if (gameState.gameOver || gameState.win) return

    if (!gameState.startTime) {
      initializeGame(row, col)
    } else {
      const newGrid = gameState.grid.map(r => [...r])
      revealCell(row, col, newGrid)
    }
  }

  const handleRightClick = (e, row, col) => {
    e.preventDefault()
    if (gameState.gameOver || gameState.win || !gameState.startTime) return

    const newGrid = gameState.grid.map(r => [...r])
    const cell = newGrid[row][col]

    if (cell.revealed) return

    if (cell.flagged) {
      newGrid[row][col] = { ...cell, flagged: false }
      setGameState(prev => ({ ...prev, flags: prev.flags + 1, grid: newGrid }))
    } else if (gameState.flags > 0) {
      newGrid[row][col] = { ...cell, flagged: true }
      setGameState(prev => ({ ...prev, flags: prev.flags - 1, grid: newGrid }))
    }
    checkWinCondition(newGrid)
  }

  const checkWinCondition = (currentGrid) => {
    let revealedCount = 0
    let flaggedMines = 0
    for (let r = 0; r < gameState.rows; r++) {
      for (let c = 0; c < gameState.cols; c++) {
        const cell = currentGrid[r][c]
        if (cell.revealed && cell.value !== -1) {
          revealedCount++
        }
        if (cell.flagged && cell.value === -1) {
          flaggedMines++
        }
      }
    }

    if (revealedCount === (gameState.rows * gameState.cols) - gameState.mines && flaggedMines === gameState.mines) {
      clearInterval(gameState.intervalId)
      setGameState(prev => ({ ...prev, gameOver: true, win: true }))
      setTimeout(() => onLevelComplete(), 1500)
    }
  }

  const resetGame = () => {
    clearInterval(gameState.intervalId)
    const { rows, cols, mines } = getGridSize(level)
    setGameState({
      grid: [],
      rows,
      cols,
      mines,
      flags: mines,
      gameOver: false,
      win: false,
      startTime: null,
      elapsedTime: 0,
      intervalId: null,
      hint: false,
    })
  }

  const showHint = () => {
    setGameState(prev => ({ ...prev, hint: !prev.hint }))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">💣 Minesweeper</h1>
            <p className="text-gray-300">Level {level} - {gameState.rows}x{gameState.cols} Grid</p>
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
          <div className="bg-gray-800 rounded-lg p-4 inline-block">
            <div className="flex items-center justify-center space-x-6 text-white">
              <div>
                <p className="text-lg font-semibold">Mines: {gameState.mines}</p>
                <p className="text-sm">Flags: {gameState.flags}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Time: {formatTime(gameState.elapsedTime)}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {gameState.hint ? "💡 Left-click to reveal, Right-click to flag. First click is always safe!" : "Find all mines without clicking on them"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-600 p-2 rounded-xl shadow-2xl border-4 border-gray-500">
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${gameState.cols}, 1fr)`,
                gridTemplateRows: `repeat(${gameState.rows}, 1fr)`,
              }}
            >
              {gameState.grid.length > 0 ? gameState.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-8 h-8 flex items-center justify-center text-lg font-bold
                      ${cell.revealed ? (cell.value === -1 ? 'bg-red-500' : 'bg-gray-300') : 'bg-gray-400 hover:bg-gray-300'}
                      ${cell.flagged ? 'text-red-600' : 'text-gray-800'}
                      ${cell.revealed && cell.value > 0 ? `text-blue-${cell.value * 100}` : ''}
                    `}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                  >
                    {cell.revealed ? (
                      cell.value === -1 ? '💣' : (cell.value === 0 ? '' : cell.value)
                    ) : (
                      cell.flagged ? '🚩' : ''
                    )}
                  </div>
                ))
              ) : (
                // Render empty grid for initial state
                Array(gameState.rows).fill(null).map((_, rowIndex) =>
                  Array(gameState.cols).fill(null).map((_, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="w-8 h-8 bg-gray-400 hover:bg-gray-300 flex items-center justify-center text-lg font-bold"
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                    ></div>
                  ))
                )
              )}
            </div>
          </div>
        </div>

        {/* Game Over / Win Message */}
        {gameState.gameOver && (
          <div className="text-center">
            <div className="bg-white p-6 rounded-xl inline-block shadow-2xl border-4
              ${gameState.win ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}
            ">
              <div className="text-4xl mb-2">{gameState.win ? '🎉' : '💥'}</div>
              <h2 className="text-2xl font-bold mb-2">{gameState.win ? 'You Win!' : 'Game Over!'}</h2>
              <p className="text-lg">{gameState.win ? 'All mines cleared!' : 'You hit a mine!'}</p>
              <Button onClick={resetGame} className="mt-4 bg-white text-gray-800 hover:bg-gray-100">
                Play Again
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-gray-800 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-gray-300 text-sm">
              Left-click to reveal a square. Right-click to flag a suspected mine. 
              Reveal all non-mine squares to win. The number on a square indicates how many mines are adjacent to it.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Minesweeper


