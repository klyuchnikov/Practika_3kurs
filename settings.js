var TableScroll = new TableScrollFunction();
TableScroll.settings = {
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

TableScroll.Load();

TableScroll.onScroll(function(leftX, topY){// fx(leftX, topY)
	//document.getElementById('info2').innerHTML += "<br>leftX: " + leftX + ", topY: " + topY;
});
TableScroll.onGetNewCells(function(arr) {// fx([] cells)
	
	for(var i = 0; i < arr.length;i++)
	{
		var item = arr[i];
		var cell = TableScroll.getCell(item.localX,item.localY);
		cell.innerHTML = '';
		var image = document.createElement('IMG');
		var f = Math.floor(item.globalX * 50 / 100);
	//	image.src = '/picture/' + f + '/' + item.globalX *50 + '_' + item.globalY*50 +'.png'
		image.src = 'pic/' + f + '/' + item.globalX *50 + '_' + item.globalY*50 +'.png'
		cell.appendChild(image);
	}
	//document.getElementById('info2').innerHTML += "<br>load row #" + row + " - " + (isTop? "сверху" : "снизу");
});
TableScroll.onCellMouseover(function (event, tableX, tableY, td){ // fx(event, tableX, tableY, target)
	document.getElementById('info').textContent = "countR: " +  tableX
	+ ";countC: " + tableY;
});

TableScroll.onCellMouseout(function (event, tableX, tableY, td){ // fx(event, tableX, tableY, target)
	
});