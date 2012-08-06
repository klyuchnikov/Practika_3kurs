// требуется подключение файла onReady.js до этого файла
function TableScrollFunction(){
	// public objects
	this.settings = {
		idDivContainer : "container", // id элемента контейнера
		tableId: 'tbl', // префикс id таблицы
		tableClass: 'tabl', // CSS class таблицы
		countRows:7, // количество строк таблицы
		countColumns : 11, // количество столбцов таблицы
		idSlider_v: 'slider_v', // id внутреннего divа который напорядок больше внешнего вертикального diva
		idSlider_h: 'slider_h', // id внутреннего divа который напорядок больше внешнего горизонтального diva
		idv_slider: 'v_slider', // id внешнего вертикального diva
		idh_slider: 'h_slider', // id внешнего горизонтального diva
		cellWidth: 50,  // ширина ячейки
		cellHeight: 50, // высота ячейки
		GlobalRow: 32,    // количество строк глобального пространства
		GlobalColumn: 25, // количество столбцов глобального пространства
		delayLoad : 200 // задержка между скролингом и началом подгрузки ячеек
	};
	this.onScroll = function(handler) { // делегат для функций скроллирования
		prSetting.scrollHandlerList.push(handler);
	}
	this.onGetNewCells = function(handler){// делегат для функций загрузки ячеек
		prSetting.getNewCellsHandlerList.push(handler);
	}
	this.onCellMouseover = function(handler){ // делегат для функций при получении фокуса ячейкой
		prSetting.cellMouseoverHandlerList.push(handler);
	};
	this.onCellMouseout = function(handler){ // делегат для функций при потери фокуса ячейкой
		prSetting.cellMouseoutHandlerList.push(handler);
	};
	this.getTable = function() { return getTable(prSetting); }; // получение DOM таблицы
	
	this.getCell = function(x,y){ return getTable(prSetting).rows[y].cells[x];} // получение DOM ячейки
	
	this.Load = function(){ // функция инициализация работы библиотеки
		onReady(_this, prSetting, function(){
			drawTable(_this, prSetting); // рисуем таблицу
			var ar = new Array(); // массив точек, ячейки которых требуется загрузить
			loadCells(); // первоначальная загрузка всех ячеек
			prSetting.lastDate = new Date(); // время последней загрузки ячеек
			getHSliler(_this).onscroll = function(){ // обработка горизонтального скроллинга
				prSetting.lastDate = new Date();// время последнего скроллинга
				prSetting.isLoadOfScroll = false;
				var lastX = prSetting.currentX;
				var x = getLeftX();
				prSetting.currentX = x;
				if (lastX != x) {
					if (x > lastX){ 
						var dx = x - lastX;
						for(var i = dx; i < _this.settings.countColumns; i++)
							for(var k = 0; k < _this.settings.countRows; k++)
								changeDataCells(i,k, i - dx, k);// перекопировние ячеек при скроллинге таблицы -->>
					} else {
						var dx = lastX - x;
						for(var i = _this.settings.countColumns - dx - 1; i > -1 ; i--)
							for(var k = 0; k < _this.settings.countRows; k++)
								changeDataCells(i,k, i + dx, k);// перекопировние ячеек при скроллинге таблицы <<--
					}
					// вызов подписанных функций на скроллирование таблицы
					for(var i = 0; i< prSetting.scrollHandlerList.length; i++) 
						prSetting.scrollHandlerList[i](getLeftX(), getTopY());
				}
				setTimeout(function() {
					var date = new Date();
					var timespan = date - prSetting.lastDate;
					if (timespan >= _this.settings.delayLoad && !prSetting.isLoadOfScroll) {
						prSetting.isLoadOfScroll = true;
						loadCells();
					}
				},_this.settings.delayLoad + 200);
			};
			getVSlider(_this).onscroll = function(){ // обработка вертикального скроллинга
				prSetting.lastDate = new Date();// время последнего скроллинга
				prSetting.isLoadOfScroll = false;
				var lastY = prSetting.currentY;
				var y = getTopY();
				prSetting.currentY = y;
				if (lastY != y)
				{
					if (y > lastY){
						var dy = y - lastY;
						for(var i = dy; i < _this.settings.countRows; i++)
							for(var k = 0; k < _this.settings.countColumns; k++)
								changeDataCells(k, i, k, i - dy); // перекопирование ячеек при скроллинге вниз
					} else {
						var dy = lastY - y;
						for(var i = _this.settings.countRows - dy - 1; i > -1 ; i--)
							for(var k = 0; k < _this.settings.countColumns; k++)
								changeDataCells(k, i, k, i + dy);// перекопирование ячеек при скроллинге вверх
					}
					// вызов подписанных функций на скроллирование таблицы
					for(var i = 0; i< prSetting.scrollHandlerList.length; i++) 
						prSetting.scrollHandlerList[i](getLeftX(), getTopY());
				}
				setTimeout(function() {
					var date = new Date();
					var timespan = date - prSetting.lastDate;
					if (timespan >= _this.settings.delayLoad && !prSetting.isLoadOfScroll) {
						prSetting.isLoadOfScroll = true;
						loadCells();
					}
				},_this.settings.delayLoad + 200);
			};
		});
	}
	
	// private objects
	var _this = this;
	var prSetting = {
		tableId: 'tbl', // id таблицы (генерируется после)
		scrollHandlerList: [], // список функций, подписанных на скроллинг fx(leftX, topY)
		getNewCellsHandlerList : [], // список функций, подписанных на загрузку ячеек  fx([] cells)
		cellMouseoverHandlerList : [], // список функций, подписанных на получение фокуса ячейкой  fx(event, tableX, tableY, target)
		cellMouseoutHandlerList : [], // список функций, подписанных на потерю фокуса ячейкой  fx(event, tableX, tableY, target)
		currentX : 0, // текущее положение верхней левой ячейки по отношению к globalTable по горизонтали
		currentY : 0, // текущее положение верхней левой ячейки по отношению к globalTable по вертикали
		lastDate : null, // последнее время выполнения задачи
		isLoadOfScroll: false, // требуется ли вызвать загрузку ячеек
		arrayIsLoadCells: new Array() // массив, проецированный на таблицу, показывающий загруженные ячейки 
	};
	
	function genId(count){ // функция генерации псевдослучайных последовательностей знаков
		var chars = '1234567890!@#$%^&*_'
		var res = '';
		for(var i = 0; i < count; i++)
			res += chars[Math.round(Math.random()*(chars.length - 1))];
		return  res;
	}
	
	function getContainer(_this){ return document.getElementById(_this.settings.idDivContainer);} // получение контейнера 
	function getTable(prSetting){ return document.getElementById(prSetting.tableId);} // получение таблицы 
	function getVSlider(_this){ return document.getElementById(_this.settings.idv_slider);} // получение вертикального ползунка
	function getHSliler(_this){ return document.getElementById(_this.settings.idh_slider);} // получение горизонтального ползунка
	function drawTable(_this, prSetting){ // генерация и вывод таблицы и ползунков
		var container = getContainer(_this);
		var table = document.createElement('TABLE');
		table.cellSpacing = 0;
		table.cellPadding = 0;
		container.appendChild(table);
		table.id = 'table_' + genId(6);
		prSetting.tableId = table.id;
		table.className = _this.settings.tableClass;
		var tbdy = document.createElement('TBODY');
		table.appendChild(tbdy);
		for (var countR=0; countR < _this.settings.countRows; countR++){
			var tr=document.createElement('TR');
			tbdy.appendChild(tr);
			prSetting.arrayIsLoadCells[countR] = new Array();
			for (var countC=0; countC < _this.settings.countColumns ;countC++){
				var td = document.createElement('TD');
				td.innerHTML = '<br>';
				tr.appendChild(td);
				prSetting.arrayIsLoadCells[countR][countC] = true;
			}
		}
		var div = document.createElement('DIV');
		div.id = _this.settings.idv_slider;
		container.appendChild(div);
		var divs = document.createElement('DIV');
		divs.id =  _this.settings.idSlider_v;
		div.appendChild(divs);
		div = document.createElement('DIV');
		div.id =  _this.settings.idh_slider;
		container.appendChild(div);
		divs = document.createElement('DIV');
		divs.id =  _this.settings.idSlider_h;
		div.appendChild(divs);
		
		// обработчики функций получения и потери фокуса ячеек 
		table.onmouseover = function(event) {
			  event = event || window.event;
			  var target = event.target || event.srcElement;
			  
			  while(target != table) {
				if (target.nodeName == 'TD') {
					for(var i = 0; i < prSetting.cellMouseoverHandlerList.length; i++){
							var tableX =  Math.round(target.offsetLeft / _this.settings.cellWidth) + getLeftX();
							var tableY = Math.round( target.offsetTop / _this.settings.cellHeight) + getTopY();
							prSetting.cellMouseoverHandlerList[i](event, tableX, tableY, target);
					   }
					return;
				}
				target = target.parentNode;
			  }
		};
		table.onmouseout = function(event) {
			  event = event || window.event;
			  var target = event.target || event.srcElement;
			  
			  while(target != table) {
				if (target.nodeName == 'TD') {
					for(var i = 0; i < prSetting.cellMouseoutHandlerList.length; i++){
							var tableX =  Math.round(target.offsetLeft / _this.settings.cellWidth) + getLeftX();
							var tableY = Math.round( target.offsetTop / _this.settings.cellHeight) + getTopY();
							prSetting.cellMouseoutHandlerList[i](event, tableX, tableY, target);
					   }
					return;
				}
				target = target.parentNode;
			  }
		};
		// применение стилей к элементам
		getContainer(_this).style.width = _this.settings.cellWidth * _this.settings.countColumns;
		var v_slider = getVSlider(_this);
		v_slider.style.height = _this.settings.countRows * _this.settings.cellHeight;
		v_slider.style.marginTop = -1 *(_this.settings.countRows * _this.settings.cellHeight);
		v_slider.style.marginLeft = (_this.settings.countColumns * _this.settings.cellWidth);
		var h_slider = getHSliler(_this);
		h_slider.style.width = _this.settings.countColumns * _this.settings.cellWidth;
	}

	function getLeftX(){ // получение значения X глобального пространства верхней левой ячейки
		var el_h = getHSliler(_this);
		var x = Math.floor(el_h.scrollLeft / (el_h.scrollWidth - _this.settings.countColumns * _this.settings.cellWidth - 0.1) * (_this.settings.GlobalColumn - _this.settings.countColumns)); 
		return x;
	}

	function getTopY(){// получение значения Y глобального пространства верхней левой ячейки
		var el_v = getVSlider(_this);
		var y = Math.floor(el_v.scrollTop / (el_v.scrollHeight - _this.settings.countRows * _this.settings.cellHeight - 0.1) * (_this.settings.GlobalRow - _this.settings.countRows)); 
		return y;
	}

	function changeDataCells(xTableSource, yTableSource, xTableDest, yTableDest) { // копирование ячеек
		var cell1 = getTable(prSetting).rows[yTableSource].cells[xTableSource];
		var cell2 = getTable(prSetting).rows[yTableDest].cells[xTableDest];
		cell2.innerHTML = cell1.innerHTML;
		if (prSetting.arrayIsLoadCells[yTableSource][xTableSource])
			prSetting.arrayIsLoadCells[yTableDest][xTableDest] = true;
		else
			prSetting.arrayIsLoadCells[yTableDest][xTableDest] = false;
		cell1.innerHTML = "";
		prSetting.arrayIsLoadCells[yTableSource][xTableSource] = true;
	}
	
	function loadCells(){ // функция вызова обработчика загрузки новых ячеек
		var ar = new Array();
		var x = prSetting.currentX;
		var y = prSetting.currentY;
		for(var i = 0; i < _this.settings.countRows; i++) 
			for(var k = 0; k < _this.settings.countColumns; k++)
				if (prSetting.arrayIsLoadCells[i][k]){
					ar.push({
					globalX: k + x, 
					globalY: i + y,
					localX: k,
					localY: i});
					prSetting.arrayIsLoadCells[i][k] = false;
				}
		if (ar.length == 0)
			return;
		for(var i = 0; i < prSetting.getNewCellsHandlerList.length; i++)
			prSetting.getNewCellsHandlerList[i](ar);
	}

}