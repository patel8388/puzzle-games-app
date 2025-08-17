import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { RotateCcw, Lightbulb, Home } from 'lucide-react'

const FruitMerge = ({ level = 1, onLevelComplete, onBack }) => {
  // Generate level data based on level number
  const generateLevel = (levelNum) => {
    const fruits = ['🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍑', '🥭']
    const gridSize = Math.min(4 + Math.floor(levelNum / 8), 8)
    const numFruitTypes = Math.min(3 + Math.floor(levelNum / 5), 6)
    
    // Create grid
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null))
    
    // Fill grid with fruits
    const selectedFruits = fruits.slice(0, numFruitTypes)
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (Math.random() > 0.3) { // 70% chance to place fruit
          grid[row][col] = {
            type: selectedFruits[Math.floor(Math.random() * selectedFruits.length)],
            level: 1,
            id: `${row}-${col}-${Date.now()}-${Math.random()}`
          }
        }
      }
    }
    
    return { grid, gridSize, fruits: selectedFruits, targetScore: 100 + levelNum * 50 }
  }

  const [gameState, setGameState] = useState(() => {
    const levelData = generateLevel(level)
    return {
      ...levelData,
      score: 0,
      moves: 0,
      completed: false,
      hint: false,
      selectedCell: null,
      combo: 0
    }
  })

  const fruitEvolution = {
    '🍎': '🍊',
    '🍊': '🍌', 
    '🍌': '🍇',
    '🍇': '🍓',
    '🍓': '🥝',
    '🥝': '🍑',
    '🍑': '🥭',
    '🥭': '🏆' // Final evolution
  }

  const checkWinCondition = () => {
    return gameState.score >= gameState.targetScore
  }

  const findMatches = (grid, row, col, fruitType, visited = new Set()) => {
    const key = `${row}-${col}`
    if (visited.has(key)) return []
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return []
    if (!grid[row][col] || grid[row][col].type !== fruitType) return []
    
    visited.add(key)
    let matches = [{ row, col }]
    
    // Check all 4 directions
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    directions.forEach(([dr, dc]) => {
      matches = matches.concat(findMatches(grid, row + dr, col + dc, fruitType, visited))
    })
    
    return matches
  }

  const handleCellClick = (row, col) => {
    if (gameState.completed) return
    
    const cell = gameState.grid[row][col]
    if (!cell) return
    
    // Find all connected fruits of the same type
    const matches = findMatches(gameState.grid, row, col, cell.type)
    
    if (matches.length >= 2) {
      const newGrid = gameState.grid.map(r => [...r])
      let newScore = gameState.score
      let newCombo = gameState.combo + 1
      
      // Remove matched fruits and calculate score
      matches.forEach(({ row: r, col: c }) => {
        newScore += (10 * cell.level) * newCombo
        newGrid[r][c] = null
      })
      
      // If 3 or more matches, create evolved fruit
      if (matches.length >= 3 && fruitEvolution[cell.type]) {
        const centerMatch = matches[Math.floor(matches.length / 2)]
        newGrid[centerMatch.row][centerMatch.col] = {
          type: fruitEvolution[cell.type],
          level: cell.level + 1,
          id: `evolved-${Date.now()}-${Math.random()}`
        }
        newScore += 50 * newCombo
      }
      
      // Apply gravity
      applyGravity(newGrid)
      
      // Fill empty spaces
      fillEmptySpaces(newGrid)
      
      const completed = newScore >= gameState.targetScore
      
      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        score: newScore,
        moves: prev.moves + 1,
        completed,
        combo: newCombo
      }))
      
      if (completed) {
        setTimeout(() => onLevelComplete(), 1500)
      }
    } else {
      // Reset combo if no match
      setGameState(prev => ({ ...prev, combo: 0 }))
    }
  }

  const applyGravity = (grid) => {
    for (let col = 0; col < grid[0].length; col++) {
      let writePos = grid.length - 1
      for (let row = grid.length - 1; row >= 0; row--) {
        if (grid[row][col]) {
          if (writePos !== row) {
            grid[writePos][col] = grid[row][col]
            grid[row][col] = null
          }
          writePos--
        }
      }
    }
  }

  const fillEmptySpaces = (grid) => {
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        if (!grid[row][col] && Math.random() > 0.7) {
          grid[row][col] = {
            type: gameState.fruits[Math.floor(Math.random() * gameState.fruits.length)],
            level: 1,
            id: `new-${Date.now()}-${Math.random()}`
          }
        }
      }
    }
  }

  const resetGame = () => {
    const levelData = generateLevel(level)
    setGameState({
      ...levelData,
      score: 0,
      moves: 0,
      completed: false,
      hint: false,
      selectedCell: null,
      combo: 0
    })
  }

  const showHint = () => {
    setGameState(prev => ({ ...prev, hint: !prev.hint }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">🍉 Fruit Merge</h1>
            <p className="text-green-100">Level {level}</p>
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
                <p className="text-lg font-semibold">Score: {gameState.score}</p>
                <p className="text-sm">Target: {gameState.targetScore}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Moves: {gameState.moves}</p>
                {gameState.combo > 1 && <p className="text-sm text-yellow-300">Combo x{gameState.combo}!</p>}
              </div>
            </div>
            <div className="mt-2">
              <div className="w-64 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((gameState.score / gameState.targetScore) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">
              {gameState.hint ? "💡 Click groups of 2+ same fruits to merge them. 3+ creates evolved fruit!" : "Match fruits to reach the target score"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow-2xl backdrop-blur-sm border border-white border-opacity-20">
            <div 
              className="grid gap-2"
              style={{ 
                gridTemplateColumns: `repeat(${gameState.gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gameState.gridSize}, 1fr)`
              }}
            >
              {gameState.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-16 h-16 bg-white bg-opacity-20 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center text-3xl hover:scale-105 hover:bg-opacity-30 ${
                      cell ? 'shadow-lg' : ''
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell && (
                      <div className="relative">
                        <span className="drop-shadow-lg">{cell.type}</span>
                        {cell.level > 1 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full text-xs flex items-center justify-center text-black font-bold">
                            {cell.level}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Win Message */}
        {gameState.completed && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
              <p className="text-lg">Delicious merging! You scored {gameState.score} points in {gameState.moves} moves.</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-green-100 text-sm">
              Click on groups of 2 or more connected fruits of the same type to merge them. 
              Groups of 3+ create evolved fruits worth more points. Reach the target score to win!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FruitMerge

