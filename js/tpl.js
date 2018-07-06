function getPalleteOption(id, name){
	return '<option value="' + id + '">' + name + '</option>'
}

function getColorOption(id, hex, code){
	return '<option value="' + id + '" data-content="<div class=\'select-color-option-block\'><div class= \'select-color-option-color\'style=\'background-color: ' + hex + ';\'></div><div class=\'select-color-option-name\'>' + code + '</div></div>">Relish</option>'
}

function getClosestColorButton(isText, id, hex, code, lvrNumeric){
	return '<div class="closest-block" data-is-text="' + isText + '" data-id="' + id + '"><div class="closest-color" style="background-color: ' + hex + '"></div><div class="closest-name">' + code + '</div><div class="closest-lvr">LRV ' + lvrNumeric + '</div></div>';
}

function getBadContrastCaption(contrast){
	return lang.contrast + ' ' + contrast + '%<span style="margin-left: 5px;"> <img class="smile" src="/i/icon-sad.svg"></span>';
}

function getGoodContrastCaption(contrast){
	return lang.contrast + ' ' + contrast + '%<span style="margin-left: 5px;"> <img class="smile" src="/i/icon-smile.svg"></span>';
}
function getLanguagesLinks(){
	var result = '';
	if(lang != ukr)
		result += '<a class="language-links" href="/?lang=ukr">Українська</a>';
	if(lang != eng)
		result += '<a class="language-links" href="/?lang=eng">English</a>';
	if(lang != rus)
		result += '<a class="language-links" href="/?lang=rus">Русский</a>';
	return result;	
}