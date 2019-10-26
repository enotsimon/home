

/**
 *  @param function getNeighboursFunc(point) -> [{point: neighbourPoint, weight: integer() | float()}]
 *    return list of all neighbours points with weight to move from given point to it
 *  @param function euristicFunc(pointFrom, pointTo) -> integer() | float()
 *    return estimated distance between two points
 *    for square map its a
 *    Math.abs(pointFrom.location.x - pointTo.location.x) + Math.abs(pointFrom.location.y - pointTo.location.y)
 *    for graphs without any coords representation its a very complicated task, suppose return just 0 (zero)
 *  @param int|float euristicWeight -- euristic distance weight multiplier
 *    you can set it to standard weight of one vertical|horisontal move
 */
export default class AStar {
  constructor(getNeighboursFunc, euristicFunc = false, euristicWeight = 1, pointIndexFunc = false) {
    this.getNeighboursFunc = getNeighboursFunc
    this.euristicFunc = euristicFunc || AStar.standardEuristic
    this.euristicWeight = euristicWeight
    this.pointIndexFunc = pointIndexFunc
  }


  static standardEuristic(pointFrom, pointTo) {
    return Math.abs(pointFrom.x - pointTo.x) + Math.abs(pointFrom.y - pointTo.y)
  }


  find(startPoint, finishPoint) {
    const openList = {}


    const closedList = {}
    this.addToOpenList(startPoint, 0, null, openList)
    this.counter = 0 // TEMP
    return this.step(openList, closedList, finishPoint)
  }


  step(openList, closedList, finishPoint) {
    this.counter++
    if (this.counter > 10000) {
      throw ('counter overflow')
    }
    if (this.openListIsEmpty(openList)) {
      return false // no way to finish
    }
    const pointObj = this.popPointFromOpenList(openList)
    // TODO -- preferable way is diagonal. do it some way
    const neighbours = this.getNeighboursFunc(pointObj.point)
    for (let i = 0; i < neighbours.length; i++) {
      const e = neighbours[i]
      const weight = e.weight + pointObj.weight + this.euristicWeight * this.euristicFunc(e.point, finishPoint)

      if (e.point == finishPoint) {
        const path = [e.point, pointObj.point]


        let iPointObj = pointObj
        while (iPointObj.parent != null) {
          path.push(iPointObj.parent.point)
          iPointObj = iPointObj.parent
        }
        return path
      }
      if (this.checkPointInClosedList(e, closedList)) {
        // just do nothing
      } else {
        const foundInOpenList = this.getFromOpenList(e, openList)
        if (foundInOpenList) {
          foundInOpenList.parent = pointObj
          foundInOpenList.weight = weight
        } else {
          this.addToOpenList(e.point, weight, pointObj, openList)
        }
      }
    }
    this.addToClosedList(pointObj, closedList)
    return this.step(openList, closedList, finishPoint)
  }


  // TODO -- its a hack -- we suggest some imput data structure
  // TODO -- change the whole func to call to this.pointIndexFunc thru all code
  listKey(pointObj) {
    if (this.pointIndexFunc) {
      return this.pointIndexFunc(pointObj.point)
    }
    return `${pointObj.point.location.x}|${pointObj.point.location.y}`
  }


  addToOpenList(point, pointWeight, parentPointObj, openList) {
    const pointObj = { point, weight: pointWeight, parent: parentPointObj }
    openList[this.listKey(pointObj)] = pointObj
  }

  openListIsEmpty(openList) {
    return Object.keys(openList).length == 0
  }

  getFromOpenList(pointObj, openList) {
    return openList[this.listKey(pointObj)]
  }

  popPointFromOpenList(openList) {
    let cur = {}; let
      index
    for (const i in openList) {
      if ((openList[i].weight < cur.weight) || !cur.weight) {
        cur = openList[i]
        index = i
      }
    }
    delete (openList[index])
    return cur
  }


  addToClosedList(pointObj, closedList) {
    closedList[this.listKey(pointObj)] = pointObj
  }

  checkPointInClosedList(pointObj, closedList) {
    return closedList[this.listKey(pointObj)] != undefined
  }
}
