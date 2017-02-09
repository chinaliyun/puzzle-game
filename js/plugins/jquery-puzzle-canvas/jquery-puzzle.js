/*
注意事项：
1、html页面中参照下面的格式
<div>
	<img />
	<img />
	<img />
	...
</div>
2、img的图片按照实际的顺序添加
3、其他的什么都不要添加
4、默认高度等于元素的宽度，即正方形，如果要设置其他的矩形，可以在参数里面设置height属性
*/
;(function($){
	$.fn.extend({
		puzzle: function(setting){
			var $ele = this;
			var defauls = {
				width: null,
				height: null,
				url : null,
				colLength: 4,		//列数
				rowLength: 4,
				zIndex: 100,
				jumpAllow: false
			}
			var options = $.extend(true,{},defauls,setting),
				_colLength = options.colLength,
				_rowLength = options.rowLength,
				_zIndex = options.zIndex,
				_jump = options.jumpAllow,
				_eleWidth = options.width ? options.width : $ele.innerWidth(),
				_eleHeight = options.height ? options.height : $ele.innerWidth(),
				_imgLength = $ele.find('img').length,
				_divWidth = Math.floor(_eleWidth/_colLength),
				_divHeight = Math.floor(_eleHeight/_rowLength),

				_compareed = false,
				_compareResult = false,
				_imgArray = new Array(),
				_imgArrayLength = _colLength*_rowLength,
				_compareA = null,_compareB = null,_compareAtop,_compareAleft,_compareBtop,_compareBleft,
				_url = options.url ? options.url : $ele.find('img').attr('src'),
				_imgData,
				_timer = 0,
				_timerSum = _colLength*_rowLength*2 + 2,
				_isAnimating = false;

			$ele.empty();
			// $ele.attr('puzzle-sueess','play');
			$ele.attr({
				'puzzle-disable': 'false',
				'puzzle-result': 'error'
			});
			function _puzzleBegin(){
					$ele.addClass('puzzleBox');
					_resetCanvas();
					_timerBegin();
					_setImgArray();
			}

			function _setImgArray(){
				// console.log('_setImgArray');
				for(i = 0; i < _imgArrayLength; i++){
					var imgArrayCont = new Array();
					_imgArray.push(imgArrayCont);
				}
				_timer++;
				_setDataTime();
				// console.log(_imgArray.length);
			}
			function _resetCanvas(){
				// console.log('_resetCanvas');
				_divHeight = Math.floor(_eleHeight/_rowLength),
				$ele.css({
					'width': _eleWidth,
					'height': _eleHeight
				})
				var canvas = document.createElement('canvas');
				$(canvas).attr({
					'width': _eleWidth,
					'height': _eleHeight
				})
				var ctx = canvas.getContext("2d");
				var img = new Image();
				img.src = _url;
				$(img).load(function(){
					$ele.css({
						'width': _divWidth * _colLength,
						'height': _divHeight * _rowLength
					})
					ctx.drawImage(img, 0, 0, _eleWidth, _eleHeight);
					_imgData = canvas.toDataURL("img");
					_setItemCss();
					_timer++;
					_setDataTime();
					// console.log(_timer);
				})
			}
			
			function _setItemCss(){
				// console.log('_setItemCss');
				for(i = 0; i < _rowLength; i++){
					for(j = 0; j < _colLength; j++){
						$ele.append('<div class="puzzleItem"></div>');
						var itemIndex = i * _colLength + j;
						var divTop = i * _divHeight;
						var divLeft = j * _divWidth;
						$ele.find('.puzzleItem').eq(itemIndex).css({
							'top': divTop,
							'left': divLeft,
							'width': _divWidth,
							'height': _divHeight,
							'z-index': _zIndex,
							'background-position': 'center center',
							'background-size': '100% 100%'
						});
						_setBackground(divTop,divLeft,itemIndex);
					}
				}
			}
			function _setBackground(divTop,divLeft,itemIndex){
				// console.log('_setBackground');
				var canvas = document.createElement('canvas');
				$(canvas).attr({
					'width': _divWidth,
					'height': _divHeight
				})
				var ctx = canvas.getContext("2d");
				var img = new Image();
				img.src = _imgData;
				var data;
				$(img).load(function(){
					ctx.drawImage(img, divLeft, divTop, _divWidth, _divHeight, 0, 0, _divWidth, _divHeight);
					data = canvas.toDataURL("img");
					_imgArray[itemIndex][0] = 'url('+data+')';
					_imgArray[itemIndex][1] = itemIndex;
					_timer++;
					_setDataTime();
					// console.log(_timer);
				})
			}
			function _setDataTime(){
				// console.log('_setDataTime');
				$ele.attr('data-timer',(_timer/_timerSum).toFixed(2));
				// $ele.attr('data-timer',_timer);
				// console.log($ele.attr('data-timer'));
				// document.title = $ele.attr('data-timer');
			}
			function _timerBegin(){
				if(_timer >= _rowLength*_colLength+2){
					setTimeout(function(){
						_resetSrc();
					},1000)
					return false;
				}else if(_timer < _rowLength*_colLength+2){
					setTimeout(function(){
						_timerBegin();
					},1)
				}
			}
			function _resetSrc(){
				// console.log('resetstrc')
				_imgArray.sort(function(){ return 0.5 - Math.random() })
				for(i = 0; i < _imgArrayLength; i++){
					$ele.find('.puzzleItem').eq(i).css({
						'background-image': _imgArray[i][0]
					});
					$ele.find('.puzzleItem').eq(i).attr('data-index',_imgArray[i][1])
				// console.log($ele.find('div').length);

					_timer++;
					_setDataTime();
				}
				
			}
			function _checkResult(firstIndex,secondIndex){
				for(i = 0; i < _imgArrayLength-1; i++){
					var firstIndex = parseInt($ele.find('.puzzleItem').eq(i).attr('data-index'));
					var secondIndex = parseInt($ele.find('.puzzleItem').eq(i+1).attr('data-index'));
					// console.log(firstIndex,secondIndex);

					if(secondIndex > firstIndex && secondIndex - firstIndex == 1){
						_compareResult = true;
					}else{
						_compareResult = false;
						return false;
					}
					if(i == _imgArrayLength-2){
						if(_compareResult){
							console.log('success');
							// setTimeout(function(){
								// alert('great!');
								$ele.attr('puzzle-result','success');
							// },10);
						}else{
							console.log('error');
						}
					}
				}
			}
			function _animate(A,B){
				$ele.find('.puzzleItem').stop(true,true);
				_isAnimating = true;
				_compareA.animate({
					'top': _compareBtop,
					'left': _compareBleft
				},400)
				_compareB.animate({
					'top': _compareAtop,
					'left': _compareAleft
				},400,function(){
					_compareA.before(_compareB.clone());
					_compareB.before(_compareA.clone());
					_compareA.remove();
					_compareB.remove();
					_checkResult();
					_isAnimating = false;
				})
			}
			$ele.on('click','.puzzleItem',function(){
				var puzzle = $ele.attr('puzzle-disable');
				console.log(puzzle)
				if(puzzle == 'false'){
					return false;
				}
				// console.log($(this).hasClass('active'));
				if(_isAnimating){
					return false;
				}
				if($(this).hasClass('active')){
					$(this).removeClass('active');
					_compareed = false;
					return false;
				}
				if(!_compareed){
					// console.log('addActive');
					$(this).addClass('active');
					_compareA = $(this);
					_compareAtop = $(this).css('top');
					_compareAleft = $(this).css('left');
					// console.log(_compareAtop,_compareAleft)
					_compareed = true;
				}else{
					_compareB = $(this);
					_compareBtop = $(this).css('top');
					_compareBleft = $(this).css('left');
					// console.log(_compareBtop,_compareBleft)
					$ele.find('.puzzleItem').removeClass('active');
					_compareed = false;
					var dataIndexA = $ele.find('.puzzleItem').index(_compareA);
					var dataIndexB = $ele.find('.puzzleItem').index(_compareB);
					if(_jump ? true : Math.abs(dataIndexA - dataIndexB) == 1 || Math.abs(dataIndexA - dataIndexB) == _colLength){
						_animate();
						// _compareed = true;
					}else{
						return false;
					}
				}
				
			})

			// console.log('object');
			$ele.begin = _puzzleBegin();
			return $ele;
			
		}
	})
})(jQuery)