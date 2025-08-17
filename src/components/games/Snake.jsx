import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '../ui/button'
import { RotateCcw, Lightbulb, Home, Play, Pause } from 'lucide-react'

const Snake = ({ level = 1, onLevelComplete, onBack }) => {
  const gridSize = 20
  const initialSpeed = Math.max(150 - level * 10, 80) // Faster as level increases
  const targetScore = 5 + level * 3 // More food needed for higher levels
  
  const [gameState, setGameState] = useState({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 0, y: 0 },
    score: 0,
    gameOver: false,
    paused: false,
    started: false,
    completed: false,
    hint: false,
    speed: initialSpeed
  })

  const [obstacles, setObstacles] = useState([])

  // Generate obstacles based on level
  useEffect(() => {
    const numObstacles = Math.floor(level / 3)
    const newObstacles = []
    
    for (let i = 0; i < numObstacles; i++) {
      let obstacle
      do {
        obstacle = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        }
      } while (
        (obstacle.x === 10 && obstacle.y === 10) || // Not on snake start
        (obstacle.x === 15 && obstacle.y === 15) || // Not on food start
        newObstacles.some(obs => obs.x === obstacle.x && obs.y === obstacle.y) // Not on other obstacles
      )
      newObstacles.push(obstacle)
    }
    
    setObstacles(newObstacles)
  }, [level])

  const generateFood = useCallback((snake, obstacles) => {
    let food
    do {
      food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      }
    } while (
      snake.some(segment => segment.x === food.x && segment.y === food.y) ||
      obstacles.some(obstacle => obstacle.x === food.x && obstacle.y === food.y)
    )
    return food
  }, [])

  const checkCollision = (head, snake, obstacles) => {
    // Wall collision
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      return true
    }
    
    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      return true
    }
    
    // Obstacle collision
    if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
      return true
    }
    
    return false
  }

  const moveSnake = useCallback(() => {
    if (gameState.paused || gameState.gameOver || !gameState.started || gameState.completed) return

    setGameState(prevState => {
      const newSnake = [...prevState.snake]
      const head = { 
        x: newSnake[0].x + prevState.direction.x, 
        y: newSnake[0].y + prevState.direction.y 
      }

      if (checkCollision(head, newSnake, obstacles)) {
        return { ...prevState, gameOver: true }
      }

      newSnake.unshift(head)

      let newFood = prevState.food
      let newScore = prevState.score
      let completed = false

      // Check if food eaten
      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        newScore += 1
        newFood = generateFood(newSnake, obstacles)
        
        if (newScore >= targetScore) {
          completed = true
        }
      } else {
        newSnake.pop()
      }

      return {
        ...prevState,
        snake: newSnake,
        food: newFood,
        score: newScore,
        completed
      }
    })
  }, [gameState.paused, gameState.gameOver, gameState.started, gameState.completed, obstacles, generateFood, targetScore])

  // Game loop
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, gameState.speed)
    return () => clearInterval(gameInterval)
  }, [moveSnake, gameState.speed])

  // Handle level completion
  useEffect(() => {
    if (gameState.completed) {
      setTimeout(() => onLevelComplete(), 1500)
    }
  }, [gameState.completed, onLevelComplete])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState.gameOver || gameState.completed) return

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (gameState.direction.y === 0) {
            setGameState(prev => ({ ...prev, direction: { x: 0, y: -1 }, started: true }))
          }
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          if (gameState.direction.y === 0) {
            setGameState(prev => ({ ...prev, direction: { x: 0, y: 1 }, started: true }))
          }
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (gameState.direction.x === 0) {
            setGameState(prev => ({ ...prev, direction: { x: -1, y: 0 }, started: true }))
          }
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (gameState.direction.x === 0) {
            setGameState(prev => ({ ...prev, direction: { x: 1, y: 0 }, started: true }))
          }
          break
        case ' ':
          e.preventDefault()
          setGameState(prev => ({ ...prev, paused: !prev.paused }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState.direction, gameState.gameOver, gameState.completed])

  const resetGame = () => {
    setGameState({
      snake: [{ x: 10, y: 10 }],
      food: generateFood([{ x: 10, y: 10 }], obstacles),
      direction: { x: 0, y: 0 },
      score: 0,
      gameOver: false,
      paused: false,
      started: false,
      completed: false,
      hint: false,
      speed: initialSpeed
    })
  }

  const startGame = () => {
    setGameState(prev => ({ ...prev, started: true, direction: { x: 1, y: 0 } }))
  }

  const togglePause = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }))
  }

  const showHint = () => {
    setGameState(prev => ({ ...prev, hint: !prev.hint }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">🐍 Snake</h1>
            <p className="text-green-200">Level {level}</p>
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
          <div className="bg-green-700 rounded-lg p-4 inline-block">
            <div className="flex items-center justify-center space-x-6 text-white">
              <div>
                <p className="text-lg font-semibold">Score: {gameState.score}</p>
                <p className="text-sm">Target: {targetScore}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Length: {gameState.snake.length}</p>
                {gameState.paused && <p className="text-sm text-yellow-300">PAUSED</p>}
              </div>
            </div>
            <div className="mt-2">
              <div className="w-64 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((gameState.score / targetScore) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-green-200 text-sm mt-2">
              {gameState.hint ? "💡 Use arrow keys or WASD to move. Eat food to grow. Avoid walls, obstacles, and yourself!" : "Eat the food to grow your snake"}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-black p-4 rounded-xl shadow-2xl border-4 border-green-600">
            <div 
              className="grid gap-0 bg-gray-900"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                width: '400px',
                height: '400px'
              }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                const x = index % gridSize
                const y = Math.floor(index / gridSize)
                
                const isSnakeHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y
                const isSnakeBody = gameState.snake.slice(1).some(segment => segment.x === x && segment.y === y)
                const isFood = gameState.food.x === x && gameState.food.y === y
                const isObstacle = obstacles.some(obstacle => obstacle.x === x && obstacle.y === y)
                
                let cellClass = 'border border-gray-800'
                let content = ''
                
                if (isSnakeHead) {
                  cellClass += ' bg-green-400'
                  content = '🐍'
                } else if (isSnakeBody) {
                  cellClass += ' bg-green-500'
                } else if (isFood) {
                  cellClass += ' bg-red-500'
                  content = '🍎'
                } else if (isObstacle) {
                  cellClass += ' bg-gray-600'
                  content = '🧱'
                } else {
                  cellClass += ' bg-gray-900'
                }
                
                return (
                  <div
                    key={index}
                    className={`${cellClass} flex items-center justify-center text-xs`}
                  >
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        {!gameState.started && !gameState.gameOver && !gameState.completed && (
          <div className="text-center mb-4">
            <Button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </div>
        )}

        {gameState.started && !gameState.gameOver && !gameState.completed && (
          <div className="text-center mb-4">
            <Button onClick={togglePause} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
              {gameState.paused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {gameState.paused ? 'Resume' : 'Pause'}
            </Button>
          </div>
        )}

        {/* Game Over Message */}
        {gameState.gameOver && (
          <div className="text-center">
            <div className="bg-red-600 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">💀</div>
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <p className="text-lg">You scored {gameState.score} out of {targetScore} points.</p>
              <Button onClick={resetGame} className="mt-4 bg-white text-red-600 hover:bg-gray-100">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Win Message */}
        {gameState.completed && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
              <p className="text-lg">Perfect! You reached {gameState.score} points with a snake length of {gameState.snake.length}!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-green-700 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="text-white font-semibold mb-2">Controls:</h3>
            <p className="text-green-200 text-sm">
              Use Arrow Keys or WASD to move • Spacebar to pause • Eat {targetScore} apples to complete the level!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Snake

