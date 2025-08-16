import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { RotateCcw, Lightbulb, Trophy, Star } from 'lucide-react'

// Generate random level data
const generateLevel = (levelNumber) => {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
  const numBolts = Math.min(3 + Math.floor(levelNumber / 10), 6)
  const numColors = Math.min(2 + Math.floor(levelNumber / 15), 4)
  
  const bolts = []
  for (let i = 0; i < numBolts; i++) {
    const boltColors = []
    const boltSize = Math.min(3 + Math.floor(levelNumber / 20), 6)
    
    for (let j = 0; j < boltSize; j++) {
      boltColors.push(colors[Math.floor(Math.random() * numColors)])
    }
    bolts.push({ id: i, colors: boltColors, nuts: [...boltColors].sort(() => Math.random() - 0.5) })
  }
  
  return { bolts, target: bolts.map(bolt => ({ id: bolt.id, colors: bolt.colors })) }
}

const NutsAndBolts = ({ level = 1, onComplete, onBack }) => {
  const [gameData, setGameData] = useState(null)
  const [selectedBolt, setSelectedBolt] = useState(null)
  const [selectedNut, setSelectedNut] = useState(null)
  const [moves, setMoves] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const data = generateLevel(level)
    setGameData(data)
    setMoves(0)
    setIsComplete(false)
    setSelectedBolt(null)
    setSelectedNut(null)
  }, [level])

  const checkWinCondition = (bolts) => {
    return bolts.every(bolt => 
      bolt.colors.every((color, index) => color === bolt.nuts[index])
    )
  }

  const handleNutClick = (boltId, nutIndex) => {
    if (isComplete) return
    
    if (selectedBolt === boltId && selectedNut === nutIndex) {
      setSelectedBolt(null)
      setSelectedNut(null)
      return
    }

    if (selectedBolt !== null && selectedNut !== null) {
      // Move nut from selected position to clicked position
      const newGameData = { ...gameData }
      const sourceBolt = newGameData.bolts.find(b => b.id === selectedBolt)
      const targetBolt = newGameData.bolts.find(b => b.id === boltId)
      
      if (sourceBolt && targetBolt && sourceBolt.nuts[selectedNut] && !targetBolt.nuts[nutIndex]) {
        // Swap nuts
        const temp = sourceBolt.nuts[selectedNut]
        sourceBolt.nuts[selectedNut] = targetBolt.nuts[nutIndex]
        targetBolt.nuts[nutIndex] = temp
        
        setGameData(newGameData)
        setMoves(moves + 1)
        
        if (checkWinCondition(newGameData.bolts)) {
          setIsComplete(true)
          setTimeout(() => onComplete && onComplete(level, moves + 1), 1000)
        }
      }
      
      setSelectedBolt(null)
      setSelectedNut(null)
    } else {
      setSelectedBolt(boltId)
      setSelectedNut(nutIndex)
    }
  }

  const resetLevel = () => {
    const data = generateLevel(level)
    setGameData(data)
    setMoves(0)
    setIsComplete(false)
    setSelectedBolt(null)
    setSelectedNut(null)
  }

  const getColorClass = (color) => {
    const colorMap = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500'
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
              💡 <strong>Goal:</strong> Sort the colored nuts on each bolt to match the target pattern shown above each bolt.
              Click on nuts to select and move them between positions.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameData.bolts.map((bolt) => (
          <Card key={bolt.id} className="p-4">
            <CardContent className="p-0">
              <div className="text-center mb-4">
                <h3 className="font-semibold mb-2">Bolt {bolt.id + 1}</h3>
                
                {/* Target pattern */}
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Target:</p>
                  <div className="flex justify-center space-x-1">
                    {bolt.colors.map((color, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full border-2 border-gray-300 ${getColorClass(color)}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Current state */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Current:</p>
                  <div className="flex justify-center space-x-1">
                    {bolt.nuts.map((nut, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                          nut ? getColorClass(nut) : 'bg-gray-200'
                        } ${
                          selectedBolt === bolt.id && selectedNut === index
                            ? 'border-yellow-400 scale-110 shadow-lg'
                            : 'border-gray-400 hover:border-gray-600'
                        }`}
                        onClick={() => handleNutClick(bolt.id, index)}
                      />
                    ))}
                  </div>
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

export default NutsAndBolts

