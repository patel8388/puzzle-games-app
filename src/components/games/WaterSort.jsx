import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { RotateCcw, Lightbulb, Trophy } from 'lucide-react'

const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan']

const generateLevel = (levelNumber) => {
  const numColors = Math.min(3 + Math.floor(levelNumber / 10), 6)
  const tubeCapacity = 4
  const numTubes = numColors + 2 // Extra empty tubes
  
  // Create tubes with mixed colors
  const tubes = []
  const colorPool = []
  
  // Fill color pool
  for (let i = 0; i < numColors; i++) {
    for (let j = 0; j < tubeCapacity; j++) {
      colorPool.push(colors[i])
    }
  }
  
  // Shuffle colors
  for (let i = colorPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[colorPool[i], colorPool[j]] = [colorPool[j], colorPool[i]]
  }
  
  // Fill tubes
  for (let i = 0; i < numColors; i++) {
    tubes.push({
      id: i,
      colors: colorPool.slice(i * tubeCapacity, (i + 1) * tubeCapacity),
      capacity: tubeCapacity
    })
  }
  
  // Add empty tubes
  for (let i = numColors; i < numTubes; i++) {
    tubes.push({
      id: i,
      colors: [],
      capacity: tubeCapacity
    })
  }
  
  return { tubes, numColors }
}

const WaterSort = ({ level = 1, onComplete, onBack }) => {
  const [gameData, setGameData] = useState(null)
  const [selectedTube, setSelectedTube] = useState(null)
  const [moves, setMoves] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const data = generateLevel(level)
    setGameData(data)
    setMoves(0)
    setIsComplete(false)
    setSelectedTube(null)
  }, [level])

  const checkWinCondition = (tubes) => {
    return tubes.every(tube => {
      if (tube.colors.length === 0) return true
      if (tube.colors.length !== tube.capacity) return false
      return tube.colors.every(color => color === tube.colors[0])
    })
  }

  const canPour = (fromTube, toTube) => {
    if (fromTube.colors.length === 0) return false
    if (toTube.colors.length >= toTube.capacity) return false
    if (toTube.colors.length === 0) return true
    
    const fromColor = fromTube.colors[fromTube.colors.length - 1]
    const toColor = toTube.colors[toTube.colors.length - 1]
    return fromColor === toColor
  }

  const handleTubeClick = (tubeId) => {
    if (isComplete) return
    
    if (selectedTube === null) {
      const tube = gameData.tubes.find(t => t.id === tubeId)
      if (tube && tube.colors.length > 0) {
        setSelectedTube(tubeId)
      }
    } else if (selectedTube === tubeId) {
      setSelectedTube(null)
    } else {
      const fromTube = gameData.tubes.find(t => t.id === selectedTube)
      const toTube = gameData.tubes.find(t => t.id === tubeId)
      
      if (canPour(fromTube, toTube)) {
        const newTubes = gameData.tubes.map(tube => {
          if (tube.id === selectedTube) {
            return { ...tube, colors: tube.colors.slice(0, -1) }
          } else if (tube.id === tubeId) {
            return { ...tube, colors: [...tube.colors, fromTube.colors[fromTube.colors.length - 1]] }
          }
          return tube
        })
        
        setGameData({ ...gameData, tubes: newTubes })
        setMoves(moves + 1)
        
        if (checkWinCondition(newTubes)) {
          setIsComplete(true)
          setTimeout(() => onComplete && onComplete(level, moves + 1), 1000)
        }
      }
      
      setSelectedTube(null)
    }
  }

  const resetLevel = () => {
    const data = generateLevel(level)
    setGameData(data)
    setMoves(0)
    setIsComplete(false)
    setSelectedTube(null)
  }

  const getColorClass = (color) => {
    const colorMap = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      cyan: 'bg-cyan-500'
    }
    return colorMap[color] || 'bg-gray-500'
  }

  if (!gameData) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Badge variant="outline">Level {level}</Badge>
          <Badge variant="secondary">Moves: {moves}</Badge>
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
              💡 <strong>Goal:</strong> Sort all colors so each tube contains only one color or is empty.
              Click a tube to select it, then click another tube to pour the top color.
              You can only pour onto the same color or into an empty space.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {gameData.tubes.map((tube) => (
          <Card 
            key={tube.id} 
            className={`cursor-pointer transition-all duration-200 ${
              selectedTube === tube.id 
                ? 'ring-2 ring-blue-500 scale-105' 
                : 'hover:scale-102'
            }`}
            onClick={() => handleTubeClick(tube.id)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-600 mb-2">Tube {tube.id + 1}</div>
                
                {/* Tube visualization */}
                <div className="relative w-12 h-32 border-2 border-gray-400 rounded-b-lg bg-gray-100 overflow-hidden">
                  {/* Water layers */}
                  {tube.colors.map((color, index) => (
                    <div
                      key={index}
                      className={`absolute bottom-0 left-0 right-0 ${getColorClass(color)} transition-all duration-300`}
                      style={{
                        height: `${((index + 1) / tube.capacity) * 100}%`,
                        zIndex: tube.colors.length - index
                      }}
                    />
                  ))}
                  
                  {/* Selection indicator */}
                  {selectedTube === tube.id && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-blue-500" />
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  {tube.colors.length}/{tube.capacity}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isComplete && (
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">Level Complete!</h2>
            <p className="text-green-700 mb-4">
              You completed level {level} in {moves} moves!
            </p>
            <div className="flex justify-center space-x-2">
              <Button onClick={() => onComplete && onComplete(level + 1, moves)}>
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

export default WaterSort

