import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { RotateCcw, Lightbulb, Trophy } from 'lucide-react'

// Tetris-like shapes
const shapes = [
  [[1, 1], [1, 1]], // Square
  [[1, 1, 1, 1]], // Line
  [[1, 1, 1], [0, 1, 0]], // T-shape
  [[1, 1, 1], [1, 0, 0]], // L-shape
  [[1, 1, 1], [0, 0, 1]], // Reverse L
  [[1, 1, 0], [0, 1, 1]], // Z-shape
  [[0, 1, 1], [1, 1, 0]], // S-shape
]

const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan']

const generateLevel = (levelNumber) => {
  const gridSize = Math.min(6 + Math.floor(levelNumber / 10), 10)
  const numShapes = Math.min(3 + Math.floor(levelNumber / 5), 6)
  
  // Create empty grid
  const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0))
  
  // Generate shapes to place
  const shapesToPlace = []
  for (let i = 0; i < numShapes; i++) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)]
    const color = colors[i % colors.length]
    shapesToPlace.push({ id: i, shape, color, placed: false })
  }
  
  return { grid, shapesToPlace, gridSize }
}

const ColorBlocks = ({ level = 1, onComplete, onBack }) => {
  const [gameData, setGameData] = useState(null)
  const [selectedShape, setSelectedShape] = useState(null)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const data = generateLevel(level)
    setGameData(data)
    setScore(0)
    setIsComplete(false)
    setSelectedShape(null)
  }, [level])

  const canPlaceShape = (grid, shape, row, col) => {
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          const newRow = row + i
          const newCol = col + j
          if (newRow >= grid.length || newCol >= grid[0].length || grid[newRow][newCol] !== 0) {
            return false
          }
        }
      }
    }
    return true
  }

  const placeShape = (grid, shape, row, col, colorValue) => {
    const newGrid = grid.map(row => [...row])
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          newGrid[row + i][col + j] = colorValue
        }
      }
    }
    return newGrid
  }

  const clearCompleteLines = (grid) => {
    let newGrid = [...grid]
    let linesCleared = 0
    
    // Check rows
    for (let i = newGrid.length - 1; i >= 0; i--) {
      if (newGrid[i].every(cell => cell !== 0)) {
        newGrid.splice(i, 1)
        newGrid.unshift(Array(newGrid[0].length).fill(0))
        linesCleared++
        i++ // Check the same row again
      }
    }
    
    // Check columns
    for (let j = 0; j < newGrid[0].length; j++) {
      if (newGrid.every(row => row[j] !== 0)) {
        for (let i = 0; i < newGrid.length; i++) {
          newGrid[i][j] = 0
        }
        linesCleared++
      }
    }
    
    return { newGrid, linesCleared }
  }

  const handleGridClick = (row, col) => {
    if (!selectedShape || isComplete) return
    
    const shape = gameData.shapesToPlace.find(s => s.id === selectedShape)
    if (!shape || shape.placed) return
    
    if (canPlaceShape(gameData.grid, shape.shape, row, col)) {
      const colorValue = selectedShape + 1
      let newGrid = placeShape(gameData.grid, shape.shape, row, col, colorValue)
      
      // Clear complete lines
      const { newGrid: clearedGrid, linesCleared } = clearCompleteLines(newGrid)
      
      // Update game state
      const newShapesToPlace = gameData.shapesToPlace.map(s => 
        s.id === selectedShape ? { ...s, placed: true } : s
      )
      
      const newScore = score + (shape.shape.flat().filter(cell => cell === 1).length * 10) + (linesCleared * 100)
      
      setGameData({
        ...gameData,
        grid: clearedGrid,
        shapesToPlace: newShapesToPlace
      })
      setScore(newScore)
      setSelectedShape(null)
      
      // Check if all shapes are placed
      if (newShapesToPlace.every(s => s.placed)) {
        setIsComplete(true)
        setTimeout(() => onComplete && onComplete(level, newScore), 1000)
      }
    }
  }

  const resetLevel = () => {
    const data = generateLevel(level)
    setGameData(data)
    setScore(0)
    setIsComplete(false)
    setSelectedShape(null)
  }

  const getColorClass = (colorIndex) => {
    const colorMap = [
      'bg-gray-200', // 0 - empty
      'bg-red-500',   // 1
      'bg-blue-500',  // 2
      'bg-green-500', // 3
      'bg-yellow-500', // 4
      'bg-purple-500', // 5
      'bg-orange-500', // 6
      'bg-pink-500',  // 7
      'bg-cyan-500'   // 8
    ]
    return colorMap[colorIndex] || 'bg-gray-500'
  }

  if (!gameData) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Badge variant="outline">Level {level}</Badge>
          <Badge variant="secondary">Score: {score}</Badge>
          {isComplete && <Badge className="bg-green-500"><Trophy className="w-3 h-3 mr-1" />Complete!</Badge>}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
            <Lightbulb className="w-4 h-4 mr-1" />
            Hint
          </Button>
          <Button variant="outline" size="sm" onClick={resetLevel}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {showHint && (
        <Card className="mb-4 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Goal:</strong> Place all colored shapes on the grid. Complete rows or columns will be cleared for bonus points!
              Select a shape below, then click on the grid to place it.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Grid */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gameData.gridSize}, 1fr)` }}>
                {gameData.grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-8 h-8 border border-gray-300 cursor-pointer transition-all duration-200 hover:border-gray-500 ${getColorClass(cell)}`}
                      onClick={() => handleGridClick(rowIndex, colIndex)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shapes Panel */}
        <div>
          <Card className="p-4">
            <CardContent className="p-0">
              <h3 className="font-semibold mb-4">Shapes to Place</h3>
              <div className="space-y-3">
                {gameData.shapesToPlace.map((shapeData) => (
                  <div
                    key={shapeData.id}
                    className={`p-2 border-2 rounded cursor-pointer transition-all duration-200 ${
                      shapeData.placed 
                        ? 'opacity-50 bg-gray-100 border-gray-300' 
                        : selectedShape === shapeData.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-500'
                    }`}
                    onClick={() => !shapeData.placed && setSelectedShape(shapeData.id)}
                  >
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(...shapeData.shape.map(row => row.length))}, 1fr)` }}>
                      {shapeData.shape.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-6 h-6 border ${
                              cell === 1 ? getColorClass(shapeData.id + 1) : 'bg-transparent border-transparent'
                            }`}
                          />
                        ))
                      )}
                    </div>
                    {shapeData.placed && <p className="text-xs text-gray-500 mt-1">Placed ✓</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isComplete && (
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">Level Complete!</h2>
            <p className="text-green-700 mb-4">
              You completed level {level} with a score of {score}!
            </p>
            <div className="flex justify-center space-x-2">
              <Button onClick={() => onComplete && onComplete(level + 1, score)}>
                Next Level
              </Button>
              <Button variant="outline" onClick={onBack}>
                Back to Games
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ColorBlocks

