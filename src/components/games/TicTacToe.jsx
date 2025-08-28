import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { RotateCcw, Lightbulb, Home } from 'lucide-react'

const TicTacToe = ({ level = 1, onLevelComplete, onBack }) => {
  // AI difficulty based on level
  const getAIDifficulty = (levelNum) => {
    if (levelNum <= 10) return 'easy'
    if (levelNum <= 30) return 'medium'
    return 'hard'
  }

  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    isPlayerTurn: true,
    winner: null,
    gameOver: false,
    playerWins: 0,
    aiWins: 0,
    draws: 0,
    gamesNeeded: Math.min(3 + Math.floor(level / 10), 7), // More games needed for higher levels
    hint: false,
    difficulty: getAIDifficulty(level)
  })

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ]

  const checkWinner = (board) => {
    for (let combination of winningCombinations) {
      const [a, b, c] = combination
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], combination }
      }
    }
    
    if (board.every(cell => cell !== null)) {
      return { winner: 'draw', combination: null }
    }
    
    return { winner: null, combination: null }
  }

  const minimax = (board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) => {
    const result = checkWinner(board)
    
    if (result.winner === 'O') return 10 - depth
    if (result.winner === 'X') return depth - 10
    if (result.winner === 'draw') return 0
    
    if (isMaximizing) {
      let maxEval = -Infinity
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O'
          const evaluation = minimax(board, depth + 1, false, alpha, beta)
          board[i] = null
          maxEval = Math.max(maxEval, evaluation)
          alpha = Math.max(alpha, evaluation)
          if (beta <= alpha) break
        }
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X'
          const evaluation = minimax(board, depth + 1, true, alpha, beta)
          board[i] = null
          minEval = Math.min(minEval, evaluation)
          beta = Math.min(beta, evaluation)
          if (beta <= alpha) break
        }
      }
      return minEval
    }
  }

  const getAIMove = (board, difficulty) => {
    const emptyCells = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null)
    
    if (difficulty === 'easy') {
      // 30% optimal, 70% random
      if (Math.random() < 0.3) {
        return getBestMove(board)
      }
      return emptyCells[Math.floor(Math.random() * emptyCells.length)]
    }
    
    if (difficulty === 'medium') {
      // 70% optimal, 30% random
      if (Math.random() < 0.7) {
        return getBestMove(board)
      }
      return emptyCells[Math.floor(Math.random() * emptyCells.length)]
    }
    
    // Hard: Always optimal
    return getBestMove(board)
  }

  const getBestMove = (board) => {
    let bestMove = -1
    let bestValue = -Infinity
    
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O'
        const moveValue = minimax(board, 0, false)
        board[i] = null
        
        if (moveValue > bestValue) {
          bestMove = i
          bestValue = moveValue
        }
      }
    }
    
    return bestMove
  }

  const handleCellClick = (index) => {
    if (gameState.board[index] || gameState.gameOver || !gameState.isPlayerTurn) return

    const newBoard = [...gameState.board]
    newBoard[index] = 'X'
    
    const result = checkWinner(newBoard)
    
    if (result.winner) {
      handleGameEnd(newBoard, result)
    } else {
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        isPlayerTurn: false
      }))
    }
  }

  const handleGameEnd = (board, result) => {
    let newPlayerWins = gameState.playerWins
    let newAIWins = gameState.aiWins
    let newDraws = gameState.draws

    if (result.winner === 'X') newPlayerWins++
    else if (result.winner === 'O') newAIWins++
    else newDraws++

    const totalGames = newPlayerWins + newAIWins + newDraws
    const levelComplete = newPlayerWins >= Math.ceil(gameState.gamesNeeded / 2)

    setGameState(prev => ({
      ...prev,
      board,
      winner: result.winner,
      gameOver: true,
      playerWins: newPlayerWins,
      aiWins: newAIWins,
      draws: newDraws,
      winningCombination: result.combination
    }))

    if (levelComplete && totalGames >= gameState.gamesNeeded) {
      setTimeout(() => onLevelComplete(), 2000)
    }
  }

  // AI move effect
  useEffect(() => {
    if (!gameState.isPlayerTurn && !gameState.gameOver) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove([...gameState.board], gameState.difficulty)
        const newBoard = [...gameState.board]
        newBoard[aiMove] = 'O'
        
        const result = checkWinner(newBoard)
        
        if (result.winner) {
          handleGameEnd(newBoard, result)
        } else {
          setGameState(prev => ({
            ...prev,
            board: newBoard,
            isPlayerTurn: true
          }))
        }
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [gameState.isPlayerTurn, gameState.gameOver])

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      isPlayerTurn: true,
      winner: null,
      gameOver: false,
      winningCombination: null
    }))
  }

  const resetLevel = () => {
    setGameState({
      board: Array(9).fill(null),
      isPlayerTurn: true,
      winner: null,
      gameOver: false,
      playerWins: 0,
      aiWins: 0,
      draws: 0,
      gamesNeeded: Math.min(3 + Math.floor(level / 10), 7),
      hint: false,
      difficulty: getAIDifficulty(level),
      winningCombination: null
    })
  }

  const showHint = () => {
    setGameState(prev => ({ ...prev, hint: !prev.hint }))
  }

  const totalGames = gameState.playerWins + gameState.aiWins + gameState.draws
  const levelComplete = gameState.playerWins >= Math.ceil(gameState.gamesNeeded / 2) && totalGames >= gameState.gamesNeeded

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">❌ Tic Tac Toe</h1>
            <p className="text-blue-200">Level {level} - {gameState.difficulty.toUpperCase()} AI</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={showHint} variant="outline" size="sm" className="text-white border-white hover:bg-yellow-500">
              <Lightbulb className="w-4 h-4" />
            </Button>
            <Button onClick={resetLevel} variant="outline" size="sm" className="text-white border-white hover:bg-blue-500">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="text-center mb-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-6 text-white">
              <div>
                <p className="text-lg font-semibold">You: {gameState.playerWins}</p>
                <p className="text-sm">Wins needed: {Math.ceil(gameState.gamesNeeded / 2)}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">AI: {gameState.aiWins}</p>
                <p className="text-sm">Draws: {gameState.draws}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Games: {totalGames}/{gameState.gamesNeeded}</p>
                {levelComplete && <p className="text-sm text-green-300">Level Complete!</p>}
              </div>
            </div>
            <p className="text-blue-200 text-sm mt-2">
              {gameState.hint ? "💡 Try to get three in a row while blocking the AI. Corner and center moves are often strongest!" : 
               gameState.isPlayerTurn ? "Your turn (X)" : "AI thinking..."}
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 p-6 rounded-xl shadow-2xl backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-2 w-80 h-80">
              {gameState.board.map((cell, index) => (
                <button
                  key={index}
                  className={`w-24 h-24 bg-white bg-opacity-20 rounded-lg text-4xl font-bold transition-all duration-200 hover:bg-opacity-30 ${
                    gameState.winningCombination?.includes(index) ? 'bg-green-400 bg-opacity-50' : ''
                  } ${
                    cell === 'X' ? 'text-blue-400' : cell === 'O' ? 'text-red-400' : 'text-gray-400'
                  }`}
                  onClick={() => handleCellClick(index)}
                  disabled={gameState.gameOver || !gameState.isPlayerTurn || cell !== null}
                >
                  {cell}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Game Status */}
        {gameState.gameOver && (
          <div className="text-center mb-6">
            <div className={`p-4 rounded-lg inline-block ${
              gameState.winner === 'X' ? 'bg-green-500' : 
              gameState.winner === 'O' ? 'bg-red-500' : 'bg-yellow-500'
            } text-white`}>
              <h3 className="text-xl font-bold mb-2">
                {gameState.winner === 'X' ? '🎉 You Win!' : 
                 gameState.winner === 'O' ? '🤖 AI Wins!' : '🤝 Draw!'}
              </h3>
              <Button onClick={resetGame} className="bg-white text-gray-800 hover:bg-gray-100">
                Next Game
              </Button>
            </div>
          </div>
        )}

        {/* Level Complete */}
        {levelComplete && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl inline-block shadow-2xl border-4 border-white">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
              <p className="text-lg">You won {gameState.playerWins} out of {totalGames} games against {gameState.difficulty} AI!</p>
              <div className="mt-4 text-3xl">⭐⭐⭐</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <p className="text-blue-200 text-sm">
              Get three X's in a row (horizontal, vertical, or diagonal) to win. 
              Win {Math.ceil(gameState.gamesNeeded / 2)} out of {gameState.gamesNeeded} games to complete the level!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicTacToe

