/** Интерфейс игры
 * кнопки "старт", "играть снова"
 * затемнение поля, очистка от шаров
 */
class Interface {
	/** Обработчик для кнопки "Начать игру" */
	static startBtnListener() {
		const displayWelcome = document.querySelector('.welcome')
		const startBtn = document.querySelector('.start-btn')
		startBtn.addEventListener('click', () => {
			displayWelcome.classList.add('up')
		})
	}

	/** Генерирует кнопку "Играть снова" */
	static restartBtnCreator() {
		const board = document.querySelector('.board')

		const button = document.createElement('button')
		button.classList.add('btn', 'restart-btn')
		button.innerText = 'Играть снова'

		board.append(button)
	}

	/** Затемнение и блокировка клеток поля при проигрыше */
	static cellsDisable() {
		const cells = document.querySelectorAll('.cell')
		for (const cell of cells) {
			cell.classList.add('cell-disable')
		}
	}

	/** Активация клеток, отмена затемнения
	 *  и очистка поля от шаров */
	static cellsEnable() {
		const cells = document.querySelectorAll('.cell')
		for (const cell of cells) {
			cell.classList.remove('cell-disable')
			let ball = cell.querySelector('.ball')
			if (ball) {
				ball.remove()
			}
		}
	}

	/** Обработчик событий для кнопки "Играть снова" */
	static playAgainBtnListener() {
		const restartBtn = document.querySelector('.restart-btn')
		restartBtn.addEventListener('click', () => {
			this.cellsEnable()
			restartBtn.remove()
			InfoUpdater.refresh()
			Game.start()
		})
	}
}

/** Обновление блока информации над игровым полем */
class InfoUpdater {
	/** Обновляет количество очков, сложенных фигур и совершенных ходов
	 * @param {{row: number; col: number; block: number;}[]} figuresArray
	 * - массив с объектами, в которых в качестве названия свойства указана фигура, а значения - количество шаров в ней 
	 */
	static updater(figuresArray) {
		const result = this.#scoresCounter(figuresArray)
		this.#scoresUpdater(result.scores)
		this.#figureCompleteUpdater(result.totalFigureCounter)
		this.#movesUpdater()
	}

	/** Подсчитывает количество очков за совершенный ход
	 * @param {{row: number; col: number; block: number;}[]} figuresArray
	 * - массив с объектами, в которых в качестве названия свойства указана фигура, а значения - количество шаров в ней
	 * @returns {{scores: number; totalFigureCounter: number;}}
	 * - scores - количество очков полученных за ход
	 * - totalFigureCounter - количество фигур сделанных за ход
	 */
	static #scoresCounter(figuresArray) {
		// количество очков
		let scores = 0
		/**  счетчик на случай, если за один ход было перемещено 2 шара, и каждый из них составил какую-то фигуру */
		let goodMoveCounter = 0
		/** Общее количество составленных фигур для всех шаров */
		let totalFigureCounter = 0

		for (const figure of figuresArray) {
			if (figure.row || figure.col || figure.block) {
				goodMoveCounter += 1
			}
			/** счетчик составленных фигур с конкретным шаром */
			let figureCounter = 0

			if (figure.row) {
				figureCounter++

				scores += figure.row
				if (figure.row === 4) {
					scores += 2
				}
				if (figure.row >= 5) {
					scores += 3
				}
			}

			if (figure.col) {
				figureCounter++

				scores += figure.col
				if (figure.col === 4) {
					scores += 2
				}
				if (figure.col >= 5) {
					scores += 3
				}
			}

			if (figure.block) {
				figureCounter++
				scores += figure.block
			}

			if (figureCounter === 2) scores += 3
			if (figureCounter === 3) scores += 5

			totalFigureCounter += figureCounter
		}

		if (goodMoveCounter === 2) {
			scores += Math.ceil(scores / 2)
		}
		return { scores, totalFigureCounter }
	}

	/** Обновляет количество очков в блоке информации
	 * @param {number} scores 
	 * - количество очков полученных за текущий ход
	 */
	static #scoresUpdater(scores) {
		const scoresInfo = document.querySelector('.scores')
		let scoresCount = Number(scoresInfo.innerHTML)
		scoresCount += scores
		scoresInfo.innerText = scoresCount
	}

	/** Обновляет количество сложенных фигур в блоке информации
	 * @param {number} figures 
	 * - количество сложенных фигур за текущий ход
	 */
	static #figureCompleteUpdater(figures) {
		const figureComplete = document.querySelector('.figure-complete')
		let figureCount = Number(figureComplete.innerHTML)
		figureCount += figures
		figureComplete.innerText = figureCount
	}

	/** Обновляет количество ходов */
	static #movesUpdater() {
		const moves = document.querySelector('.moves')
		moves.innerHTML = Number(moves.innerHTML) + 1
	}

	/** Подсчитывает и обновляет количество пустых клеток на поле
	 * @returns {number} количество пустых клеток оставшихся на поле
	 */
	static freeCellCounter() {
		const freeCells = document.querySelector('.free-cells')

		const totalCells = document.querySelectorAll('.cell')
		const totalBall = document.querySelectorAll('.ball')

		let diff = totalCells.length - totalBall.length

		freeCells.innerHTML = diff

		return diff
	}

	/** Обнуление значений в блоке информации */
	static refresh() {
		const scoresInfo = document.querySelector('.scores')
		scoresInfo.innerText = 0
		const figureComplete = document.querySelector('.figure-complete')
		figureComplete.innerText = 0
		const moves = document.querySelector('.moves')
		moves.innerText = 0
	}
}

/** Генерирует шары на игровом поле */
class BallsRender {
	/** основной массив с цветами */
	static #COLORS = [
		'rgb(153, 0, 0)',
		'rgb(0, 153, 0)',
		'rgb(0, 0, 153)',

		'rgb(153, 153, 0)',
		'rgb(0, 153, 153)',
		'rgb(153, 0, 153)',

		'rgb(50, 50, 50)',
		'rgb(153, 153, 153)',
		'rgb(255, 255, 255)',
	]

	/** Генерирует 3 шара случайного цвета на свободных клетках поля,
	 * если свободных клеток меньше трех, шаров будет по количеству свободных клеток
	 * @returns {Array<Element | null>}
	 * - возвращает массив со сгенерированными шарами
	 */
	static make() {
		let cellsArray = [...document.getElementsByClassName('cell')]
		const gottenBalls = []

		for (let i = 1; i <= 3; i++) {
			let loopAgain = false
			do {
				if (cellsArray.length === 0) {
					break
				}

				let index = this.#getRandomNumber(0, cellsArray.length - 1)
				let cell = cellsArray[index]
				let ball = cell.querySelector('.ball')

				if (ball === null) {
					let gottenBall = this.#getBall()
					cell.append(gottenBall)
					gottenBalls.push(gottenBall)
					loopAgain = false
				} else {
					cellsArray.splice(index, 1)
					loopAgain = true
				}
			} while (loopAgain)
		}
		return gottenBalls
	}

	/** Получить шар случайного цвета */
	static #getBall() {
		const color = this.#getRandomColor()
		const ball = document.createElement('div')
		ball.classList.add('ball')
		ball.style.background = `radial-gradient(circle at 10px 10px, ${color}, #000)`
		return ball
	}

	/** Получить случайный цвет из массива с цветами */
	static #getRandomColor() {
		const index = this.#getRandomNumber(0, this.#COLORS.length - 1)
		return this.#COLORS[index]
	}

	/** Получить случайное число в указанном диапазоне
	 * @param {number} min - минимальное число
	 * @param {number} max - максимальное число
	 * @returns {number}
	 */
	static #getRandomNumber(min, max) {
		return Math.round(Math.random() * (max - min) + min)
	}
}

/** Ищет путь между клетками и помечает его */
class WayChecker {
	/** Шаг между начальной и конечной клетками
	 * @typedef {Object} Step
	 * @property {Element} cell - текущая клетка
	 * @property {Number} distance - расстояние между текущей и конечной клеткой
	 * @property {Array<Element>} way - массив клеток образующих путь от стартовой клетки поиска к текущей клетке
	*/

	/** Поиск пути от текущей кликнутой клетки к целевой клетке для перемещения шара
	 * @param {Element} activeCell - текущая клетка с шаром
	 * @param {Element} targetCell - клетка для перемещения шара
	 * @returns {Array<Element>|false}
	 * - Cells[] - путь между activeCell и targetCell
	 * - false - путь не найден
	 */
	static check(activeCell, targetCell) {
		/** Очередь шагов на проверку
		 * @type {Array<Step>} */
		const stepsQueue = []

		/** Список проверенных шагов
		 * @type {Array<Step>} */
		const stepsReady = []

		/** Путь между activeCell и targetCell
		 * @type {Array<Element>}
		 */
		let finalPath = []

		/** Шаг между начальной и конечной клетками
		 * @type {Step} */
		let step = {
			cell: activeCell,
			distance: this.#getDistanceToTarget(activeCell, targetCell),
			way: []
		}

		stepsQueue.push(step)

		let iteration = 0
		loop_while: while (stepsQueue.length > 0) {
			// защита от зависания для тестов
			iteration++
			if (iteration > 100) break

			let checkingStep = stepsQueue.shift()
			stepsReady.push(checkingStep)

			// Массив смежных клеток для проверяемой
			let cellsSet = this.#cellSetChecker(checkingStep.cell)

			loop_forOf: for (const cell of cellsSet) {
				// путь к текущей клетке от стартовой
				let path = checkingStep.way.slice()
				path.push(checkingStep.cell)

				// проверяю является ли текущая клетка конечной
				if (cell === targetCell) {
					path.push(cell)
					finalPath = path
					break loop_while
				}

				// если в клетке шар, пропускаю ее
				if (cell.querySelector('.ball')) continue loop_forOf

				step = {
					cell: cell,
					distance: this.#getDistanceToTarget(cell, targetCell),
					way: path
				}

				// Если такого шага еще нет в очереди и среди готовых, добавляю в очередь
				if (!this.#isStepInArray(step, stepsQueue) && !this.#isStepInArray(step, stepsReady)) {
					stepsQueue.push(step)
				}
			}

			// сортирую очередь шагов по расстоянию до конечной клетки
			stepsQueue.sort((a, b) => {
				return a.distance - b.distance
			})
		}

		if (finalPath.length > 0) return finalPath
		return false
	}

	/** Маркировка пути между активной и целевой клетками
	 * очистка маркеров через указанное время
	 * @param {Array<Element>} way - массив клеток полученный из метода проверяющего путь
	 * @param {number} ms - время в миллисекундах 
	*/
	static marking(way, ms) {
		this.#marksMake(way)

		setTimeout(() => {
			WayChecker.#marksClear()
		}, ms)
	}

	/** Маркировка пути между активной и целевой клетками
	 * @param {Array<Element>} way - массив клеток полученный из метода проверяющего путь
	*/
	static #marksMake(way) {
		let ball = way[0].querySelector('.ball')
		let lastCell = way.pop()
		let ballInLastCell = lastCell.querySelector('.ball')

		for (const cell of way) {
			if (cell === way[0] && ballInLastCell) {
				continue
			}

			let wayMarker = document.createElement('div')
			wayMarker.classList.add('way-marker')
			wayMarker.style.background = ball.style.background
			cell.append(wayMarker)
		}
	}

	/** Очистка маркеров пути */
	static #marksClear() {
		const markers = document.querySelectorAll('.way-marker')
		markers.forEach(marker => marker.remove())
	}

	/** Рассчитывает расстояние от текущей клетки до целевой
	 * @param {Element} currentCell - текущая клетка
	 * @param {Element} targetCell - целевая клетка
	 * @returns {Number} расстояние между клетками 
	 */
	static #getDistanceToTarget(currentCell, targetCell) {
		const currRow = Number(currentCell.dataset.row)
		const currCol = Number(currentCell.dataset.col)

		const targetRow = Number(targetCell.dataset.row)
		const targetCol = Number(targetCell.dataset.col)

		const diffRow = currRow - targetRow
		const diffCol = currCol - targetCol

		const distance = Math.sqrt(Math.pow(diffRow, 2) + Math.pow(diffCol, 2))

		return Number(distance.toFixed(2))
	}

	/** Проверяет клетки прилегающие к указанной
	 * @param {Element} cell
	 * @returns {Array<Element>}
	 * - возвращает массив с клетками
	 */
	static #cellSetChecker(cell) {
		const row = Number(cell.dataset.row)
		const col = Number(cell.dataset.col)

		let cellsSet = []
		// left cell
		cellsSet.push(document.querySelector(`.cell[data-row="${row}"][data-col="${col - 1}"]`))
		// right cell
		cellsSet.push(document.querySelector(`.cell[data-row="${row}"][data-col="${col + 1}"]`))
		// bottom cell
		cellsSet.push(document.querySelector(`.cell[data-row="${row - 1}"][data-col="${col}"]`))
		// top cell
		cellsSet.push(document.querySelector(`.cell[data-row="${row + 1}"][data-col="${col}"]`))

		let result = cellsSet.filter(cellInSet => {
			if (cellInSet) return true
			return false
		})

		return result
	}

	/** Проверяет содержит ли указанный массив текущий "шаг".
	 * При нахождении, сравнивает длину пути от стартовой клетки до текущей у элемента массива и проверяемого "шага", если у "шага" путь короче, данные у элемента массива оптимизируются 
	 * 
	 * @param {Step} step 
	 * @param {Array<Step>} array
	 * 
	 * @returns {boolean}
	 * - true - если "шаг" найден
	 * - false - в противном случае
	 */
	static #isStepInArray(step, array) {
		for (const element of array) {
			if (element.cell === step.cell) {
				if (element.way.length > step.way.length) {
					element.way = step.way
				}
				return true
			}
		}
		return false
	}
}

/** Проверяет фигуры на поле и удаляет их */
class FigureChecker {
	/** проверка наличия фигур на поле 
	 * @param {Element | null} balls - один или несколько шаров для проверки
	 * @returns {Array<{row: number; col: number; block: number;}>}
	 * - возвращает массив с объектами, в которых в качестве свойства указана фигура, а значения - количество шаров в ней
	*/
	static check(...balls) {
		let goodMoves = []
		for (const ball of balls) {
			if (!ball) continue
			const ballsInRow = this.#ballsInRowCheck(ball)
			const ballsInCol = this.#ballsInColCheck(ball)
			const ballsInBlock = this.#ballsInBlockCheck(ball)

			let ballsPreparing = this.#ballsRemovePreparing(ballsInRow, ballsInCol, ballsInBlock)
			this.remove(ballsPreparing)

			goodMoves.push({
				row: ballsInRow.length,
				col: ballsInCol.length,
				block: ballsInBlock.length
			})
		}
		return goodMoves
	}

	// #### Методы помощники #### //

	/** получить номер ряда клетки, в которой находится шар 
	 * @param {Element} ball
	 * @returns {number}
	*/
	static #getRowNumber(ball) {
		return Number(ball.parentElement.dataset.row)
	}

	/** получить номер колонки клетки, в которой находится шар 
	 * @param {Element} ball
	 * @returns {number}
	*/
	static #getColNumber(ball) {
		return Number(ball.parentElement.dataset.col)
	}

	/** Получить шар по указанным координатам
	 * @param {number} row - ряд шара 
	 * @param {number} col - колонка шара
	 * @returns { Element | null}
	 * - Element -  шар, если он есть в указанной клетке
	 * - null - если клетка пустая или не существует
	 */
	static #getBallByCoordinates(row, col) {
		const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)
		if (cell) {
			return cell.querySelector('.ball')
		}
		return null
	}

	/** Сравнить цвет двух шаров
	 * @param {Element|null} currentBall - текущий шар
	 * @param {Element|null} checkBall - проверяемый шар
	 * @returns {boolean}
	 * - true - цвет шаров совпадает
	 * - false - цвета разные, либо один из шаров не существует
	 */
	static #ballsColorChecker(currentBall, checkBall) {
		if (currentBall && checkBall) {
			if (currentBall.style.background === checkBall.style.background) {
				return true
			}
		}
		return false
	}

	// #### Поиск фигур на поле #### //

	/** Проверяет одноцветные шары в ряду и возвращает массив подходящих
	 * @param {Element} ball
	 * @returns {Array<Element|null>}
	 * - массив  шаров совпадающих по цвету и примыкающих к проверяемому
	 * - пустой массив, если подходящих шаров нет
	*/
	static #ballsInRowCheck(ball) {
		const row = this.#getRowNumber(ball)
		const col = this.#getColNumber(ball)

		let rowBalls = []

		// шары слева от проверяемого
		for (let colIndexLeft = col - 1; colIndexLeft >= 1; colIndexLeft--) {
			let ballCheck = this.#getBallByCoordinates(row, colIndexLeft)
			if (this.#ballsColorChecker(ball, ballCheck)) {
				rowBalls.push(ballCheck)
			} else {
				break
			}
		}

		// кликнутый шар
		rowBalls.push(ball)

		// шары справа от проверяемого
		for (let colIndexRight = col + 1; colIndexRight <= 10; colIndexRight++) {
			let ballCheck = this.#getBallByCoordinates(row, colIndexRight)
			if (this.#ballsColorChecker(ball, ballCheck)) {
				rowBalls.push(ballCheck)
			} else {
				break
			}
		}

		if (rowBalls.length >= 3) {
			return rowBalls
		}
		return []
	}

	/** Проверяет одноцветные шары в колонке и возвращает массив подходящих
	 * @param {Element} ball
	 * @returns {Array<Element|null>}
	 * - массив  шаров совпадающих по цвету и примыкающих к проверяемому
	 * - пустой массив, если подходящих шаров нет
	*/
	static #ballsInColCheck(ball) {
		const row = this.#getRowNumber(ball)
		const col = this.#getColNumber(ball)

		let colBalls = []

		// шары снизу от проверяемого
		for (let rowIndexBottom = row - 1; rowIndexBottom >= 1; rowIndexBottom--) {
			let ballCheck = this.#getBallByCoordinates(rowIndexBottom, col)
			if (this.#ballsColorChecker(ball, ballCheck)) {
				colBalls.push(ballCheck)
			} else {
				break
			}
		}

		// кликнутый шар
		colBalls.push(ball)

		// шары сверху от проверяемого
		for (let rowIndexTop = row + 1; rowIndexTop <= 10; rowIndexTop++) {
			let ballCheck = this.#getBallByCoordinates(rowIndexTop, col)
			if (this.#ballsColorChecker(ball, ballCheck)) {
				colBalls.push(ballCheck)
			} else {
				break
			}
		}

		if (colBalls.length >= 3) {
			return colBalls
		}
		return []
	}

	/** Проверяет шары в блоке 2х2 и,
	 * возвращает массив с подходящими шарами
	 * @param {Element} ball
	 * @returns {Array<Element|null>}
	 * - массив  шаров совпадающих по цвету и примыкающих к проверяемому
	 * - пустой массив, если подходящих шаров нет
	 */
	static #ballsInBlockCheck(ball) {
		const row = this.#getRowNumber(ball)
		const col = this.#getColNumber(ball)

		let ballsInBlock = []

		// расположение шаров относительно проверяемого
		let ballBottom = this.#getBallByCoordinates(row - 1, col)
		let ballTop = this.#getBallByCoordinates(row + 1, col)

		let ballLeft = this.#getBallByCoordinates(row, col - 1)
		let ballRight = this.#getBallByCoordinates(row, col + 1)

		if (this.#ballsColorChecker(ball, ballBottom)) {

			if (this.#ballsColorChecker(ball, ballLeft)) {
				let ballBottomLeft = this.#getBallByCoordinates(row - 1, col - 1)
				if (this.#ballsColorChecker(ball, ballBottomLeft)) {
					// текущий шар сверху справа
					ballsInBlock.push(ball, ballBottom, ballLeft, ballBottomLeft)
				}
			}

			if (this.#ballsColorChecker(ball, ballRight)) {
				let ballBottomRight = this.#getBallByCoordinates(row - 1, col + 1)
				if (this.#ballsColorChecker(ball, ballBottomRight)) {
					// текущий шар сверху слева
					ballsInBlock.push(ball, ballBottom, ballRight, ballBottomRight)
				}
			}
		}

		if (this.#ballsColorChecker(ball, ballTop)) {

			if (this.#ballsColorChecker(ball, ballLeft)) {
				let ballTopLeft = this.#getBallByCoordinates(row + 1, col - 1)
				if (this.#ballsColorChecker(ball, ballTopLeft)) {
					// текущий шар снизу справа
					ballsInBlock.push(ball, ballTop, ballLeft, ballTopLeft)
				}
			}

			if (this.#ballsColorChecker(ball, ballRight)) {
				let ballTopRight = this.#getBallByCoordinates(row + 1, col + 1)
				if (this.#ballsColorChecker(ball, ballTopRight)) {
					// текущий шар снизу слева
					ballsInBlock.push(ball, ballTop, ballRight, ballTopRight)
				}
			}
		}

		return ballsInBlock
	}

	// #### Удаление шаров #### //

	/** Подготавливает массив шаров для удаления
	 * Собирает один массив из трех и удаляет дубли
	 * 
	 * @param {Array<Element | null>} ballsInRow
	 * @param {Array<Element | null>} ballsInCol
	 * @param {Array<Element | null>} ballsInBlock
	 * @returns {Array<Element | null>}
	 */
	static #ballsRemovePreparing(ballsInRow, ballsInCol, ballsInBlock) {
		let ballsForRemove = []
		ballsForRemove.push(...ballsInRow)

		for (const ball of ballsInCol) {
			if (!ballsForRemove.includes(ball)) {
				ballsForRemove.push(ball)
			}
		}

		for (const ball of ballsInBlock) {
			if (!ballsForRemove.includes(ball)) {
				ballsForRemove.push(ball)
			}
		}

		return ballsForRemove
	}

	/** Удаляет одинаковые шары из линии или блока 
	 * @param {Array<Element| null>} balls
	*/
	static remove(balls) {
		for (const ball of balls) {
			ball.remove()
		}
	}
}

/** Основной класс игры */
class Game {
	/** Начало игры.
	 * Выбрасывание первых шариков */
	static start() {
		Interface.startBtnListener()

		let figureCount = 0
		do {
			let balls = BallsRender.make()
			let figures = FigureChecker.check(...balls)

			for (const figure of figures) {
				figureCount += figure.row
				figureCount += figure.col
				figureCount += figure.block
			}
		} while (figureCount > 0);

		InfoUpdater.freeCellCounter()
	}

	/** Процесс игры. 
	 * Отслеживание нажатия на клетки поля, 
	 * перемещение шариков, удаление фигур, 
	 * обновление информации */
	static process() {
		const cells = document.querySelectorAll('.cell')
		/** Кликнутая клетка с шаром
		 * @type {Element} */
		let activeCell = ''
		/** шар в кликнутой клетке 
		 * @type {Element} */
		let activeBall = ''
		// добавление слушателя событий для всех клеток
		for (const targetCell of cells) {
			targetCell.addEventListener('click', () => {
				/** шар в целевой клетке */
				let targetBall = targetCell.querySelector('.ball')
				// если активной клетки нет
				if (!activeCell) {
					// если в целевой клетке есть шар, делаю клетку активной
					if (targetBall) {
						activeCell = targetCell
						activeBall = targetBall
						activeBall.classList.add('active-ball')
					}
					// если активная клетка уже есть 
				} else {
					/** клетки между activeCell, targetCell */
					let way = WayChecker.check(activeCell, targetCell)

					if (way && activeCell !== targetCell) {
						// если путь найден и клетки разные

						if (targetBall) {
							// если в целевой клетке уже есть шар
							if (activeBall.style.background !== targetBall.style.background) {
								// если шары разного цвета
								WayChecker.marking(way, 500)
								this.#addingNewBalls(900)
								this.#figureChecking(activeBall, targetBall, 600)

								targetCell.append(activeBall)
								activeCell.append(targetBall)
							}

						} else {
							// если клетка пустая
							WayChecker.marking(way, 500)
							this.#addingNewBalls(900)
							this.#figureChecking(activeBall, targetBall, 600)
							
							targetCell.append(activeBall)
						}

					} else {
						// если путь к целевой клетке не найден
						targetCell.style.background = 'red'
						setTimeout(() => {
							targetCell.style.background = ''
						}, 300)
					}

					activeBall.classList.remove('active-ball')
					activeCell = ''
					activeBall = ''
				}
			})
		}
	}

	/** При завершении игры показывает кнопку "играть снова" */
	static finish() {
		Interface.restartBtnCreator()
		Interface.cellsDisable()
		Interface.playAgainBtnListener()

	}

	/** Добавление новых шаров на поле после указанной задержки,
	 * проверка пустых клеток и обновление информации
	 * @param {number} ms - задержка в миллисекундах 
	 */
	static #addingNewBalls(ms) {
		setTimeout(function () {
			let ballsFromRender = BallsRender.make()

			FigureChecker.check(...ballsFromRender)

			if (InfoUpdater.freeCellCounter() <= 0) {
				Game.finish()
			}
		}, ms)
	}

	/** Проверка получившихся фигур
	 * удаление их с поля после указанной задержки
	 * обновление очков 
	 * @param {Element | null} activeBall - активный шар
	 * @param {Element | null} targetBall - целевой шар
	 * @param {number} ms - задержка в миллисекундах 
	*/
	static #figureChecking(activeBall, targetBall, ms) {

		setTimeout(function (activeBall, targetBall) {
			let figureComplete = FigureChecker.check(activeBall, targetBall)
			InfoUpdater.updater(figureComplete)
		}, ms, activeBall, targetBall)
	}
}

// Игра
Game.start()

Game.process()
