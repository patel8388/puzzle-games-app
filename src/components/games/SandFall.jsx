import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { RotateCcw, Lightbulb, Home } from 'lucide-react'

const SandFall = ({ level = 1, onLevelComplete, onBack }) => {
  // Generate level data based on level number
  const generateLevel = (levelNum) => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink']
    const gridSize = Math.min(8 + Math.floor(levelNum / 10), 12)
    const numColors = Math.min(3 + Math.floor(levelNum / 5), 6)
    
    // Create grid
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null))
    
    // Add obstacles (black blocks)
    const numObstacles = Math.floor(levelNum / 3) + 2
    for (let i = 0; i < numObstacles; i++) {
      const row = Math.floor(Math.random() * (gridSize - 2)) + 1
      const col = Math.floor(Math.random() * gridSize)
      grid[row][col] = 'obstacle'
    }
    
    // Add sand particles at top
    const particlesPerColor = 3 + Math.floor(levelNum / 8)
    for (let colorIndex = 0; colorIndex < numColors; colorIndex++) {
      for (let i = 0; i < particlesPerColor; i++) {
        let placed = false
        let attempts = 0
        while (!placed && attempts < 50) {
          const col = Math.floor(Math.random() * gridSize)
          const row = Math.floor(Math.random() * 3) // Top 3 rows
          if (!grid[row][col]) {
            grid[row][col] = colors[colorIndex]
            placed = true
          }
          attempts++
        }
      }
    }
    
    return { grid, gridSize, colors: colors.slice(0, numColors) }
  }

  const [gameState, setGameState] = useState(() => {
    const levelData = generateLevel(level)
    return {
      ...levelData,
      moves: 0,
      completed: false,
      hint: false,
      falling: false
    }
  })

  const colors = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    obstacle: 'bg-gray-800'
  }

  // Simulate sand falling physics
  const simulateFall = (grid) => {
    const newGrid = grid.map(row => [...row])
    let changed = true
    
    while (changed) {
      changed = false
      for (let row = newGrid.length - 2; row >= 0; row--) {
        for (let col = 0; col < newGrid[row].length; col++) {
          if (newGrid[row][col] && newGrid[row][col] !== 'obstacle') {
            // Check if can fall down
            if (!newGrid[row + 1][col]) {
              newGrid[row + 1][col] = newGrid[row][col]
              newGrid[row][col] = null
              changed = true
            }
            // Check if can fall diagonally
            else if (col > 0 && !newGrid[row + 1][col - 1] && Math.random() > 0.5) {
              newGrid[row + 1][col - 1] = newGrid[row][col]
              newGrid[row][col] = null
              changed = true
            }
            else if (col < newGrid[row].length - 1 && !newGrid[row + 1][col + 1] && Math.random() > 0.5) {
              newGrid[row + 1][col + 1] = newGrid[row][col]
              newGrid[row][col] = null
              changed = true
            }
          }
        }
      }
    }
    
    return newGrid
  }

  const checkWinCondition = (grid) => {
    // Check if sand particles are separated by color in bottom rows
    const bottomRows = grid.slice(-3)
    const colorGroups = {}
    
    bottomRows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell && cell !== 'obstacle') {
          if (!colorGroups[cell]) colorGroups[cell] = []
          colorGroups[cell].push({ row: rowIndex, col: colIndex })
        }
      })
    })
    
    // Check if each color forms a connected group
    return Object.values(colorGroups).every(positions => {
      if (positions.length <= 1) return true
      
      // Simple connectivity check
      const visited = new Set()
      const stack = [positions[0]]
      visited.add(`${positions[0].row}-${positions[0].col}`)
      
      while (stack.length > 0) {
        const current = stack.pop()
        const neighbors = [
          { row: current.row - 1, col: current.col },
          { row: current.row + 1, col: current.col },
          { row: current.row, col: current.col - 1 },
          { row: current.row, col: current.col + 1 }
        ]
        
        neighbors.forEach(neighbor => {
          const key = `${neighbor.row}-${neighbor.col}`
          if (!visited.has(key)) {
            const found = positions.find(p => p.row === neighbor.row && p.col === neighbor.col)
            if (found) {
              visited.add(key)
              stack.push(found)
            }
          }
        })
      }
      
      return visited.size === positions.length
    })
  }

  const handleCellClick = (row, col) => {
    if (gameState.completed || gameState.falling) return
    
    const cell = gameState.grid[row][col]
    if (!cell || cell === 'obstacle') return
    
    // Remove the clicked particle
    const newGrid = gameState.grid.map(r => [...r])
    newGrid[row][col] = null
    
    setGameState(prev => ({ ...prev, falling: true }))
    
    // Simulate falling
    setTimeout(() => {
      const fallenGrid = simulateFall(newGrid)
      const completed = checkWinCondition(fallenGrid)
      
      setGameState(prev => ({
        ...prev,
        grid: fallenGrid,
        moves: prev.moves + 1,
        completed,
        falling: false
      }))
      
      if (completed) {
        setTimeout(() => onLevelComplete(), 1500)
      }
    }, 300)
  }

  const resetGame = () => {
    const levelData = generateLevel(level)
    setGameState({
      ...levelData,
      moves: 0,
      completed: false,
      hint: false,
      falling: false
    })
  }

  const showHint = () => {
    setGameState(prev => ({ ...prev, hint: !prev.hint }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">⏳ Sand Fall</h1>
            <p className="text-indigo-200">Level {level}</p>
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
          <div className="bg-indigo-800 rounded-lg p-4 inline-block">
            <p className="text-white text-lg font-semibold">Moves: {gameState.moves}</p>
            <p className="text-indigo-200 text-sm mt-1">
              {gameState.hint ? "💡 Click sand particles to remove them and let others fall into groups!" : "Remove sand to create color groups"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 p-4 rounded-xl shadow-2xl border-4 border-gray-700">
            <div 
              className="grid gap-1"
              style={{ 
                gridTemplateColumns: `repeat(${gameState.gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gameState.gridSize}, 1fr)`
              }}
            >
              {gameState.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-8 h-8 border border-gray-600 cursor-pointer transition-all duration-200 ${
                      cell ? colors[cell] : 'bg-gray-800'
                    } ${
                      cell && cell !== 'obstacle' ? 'hover:scale-110 hover:shadow-lg' : ''
                    } ${
                      gameState.falling ? 'animate-pulse' : ''
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell === 'obstacle' && (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <div className="w-4 h-4 bg-gray-700 rounded"></div>
                      </div>
                    )}
                    {cell && cell !== 'obstacle' && (
                      <div className="w-full h-full rounded-sm shadow-inner flex items-center justify-center">
                        <div className="w-2 h-2 bg-white bg-opacity-30 rounded-full"></div>
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
              <p className="text-lg">Perfect sand sorting! You completed it in {gameState.moves} moves.</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-indigo-800 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-indigo-200 text-sm">
              Click on sand particles to remove them. The remaining sand will fall down due to gravity. 
              Group sand particles of the same color together to win!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SandFall

