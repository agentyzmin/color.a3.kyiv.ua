jQuery(function($) {
    var $palettes = $('#palettes'),
        $textColor = $('#text').find('select.color-select'),
        $bgColor = $('#background').find('select.color-select'),
        palette = data[0];

    var langParam = getParameterByName('lang');
    var lang;
    switch(langParam){
        case 'en':
        case 'eng':
            lang = eng;
            break;
        case 'ru':
        case 'rus':
            lang = rus;
            break;
        case 'ua':
        case 'ukr':
        default:
            lang = ukr;
            break;
    }

    $('#languages').html(getLanguagesLinks());

    subscribeForEvents();
    initText();
    initPallete();

    function subscribeForEvents(){
        $palettes.on('changed.bs.select', onPaletteSelect);
        $textColor.on('changed.bs.select', onColorSelect);
        $bgColor.on('changed.bs.select', onColorSelect); 
    }

    function initText() {
        $('#palleteSelectCaption').text(lang.palette);
        $('#textSelectCaption').text(lang.text);
        $('#backgroundSelectCaption').text(lang.background);
        $('div.color-name > span.caption').text(lang.name);
        $('#preview > div > div').text(lang.text);
        $('span.logo-text').text(lang.agents);
        $('h1.title').text(lang.title);
        $('#about').text(lang.about);
    }

    function initPallete() {        
        data.forEach(function(pal, i) {
            pal.id = i;
            $palettes.append(getPalleteOption(pal.id, pal.name));
        });  
        var palleteId = getParameterByName("palleteId");
        if(isNaN(palleteId) || palleteId == null || palleteId == "null" || palleteId == "NaN") palleteId = 0;     
        $palettes.selectpicker('val', palleteId);
        $palettes.selectpicker('refresh');
    }    
    
    function onPaletteSelect(e) {
        var palleteId = parseInt($palettes.val());
        palette = data[palleteId];
        $textColor.html('');
        $bgColor.html('');
        var textColorId = getParameterByName("textColorId");
        if(isNaN(textColorId) || textColorId == null || textColorId == "null" || textColorId == "NaN") textColorId = 0;  
        var bgColorId = getParameterByName("bgColorId");
        if(isNaN(bgColorId) || bgColorId == null || bgColorId == "null" || bgColorId == "NaN") bgColorId = 0;  
        palette.colors.forEach(function(item, i) {
            item.id = i;
            $textColor.append(getColorOption(item.id, item.hex, item.code));
            $bgColor.append(getColorOption(item.id, item.hex, item.code));
        });
        $textColor.selectpicker('val', textColorId);
        $bgColor.selectpicker('val', bgColorId);
    }

    
    function onColorSelect(e) {        
        var id = parseInt($(e.target).val());
        var color = palette.colors[id];
        if(!color) {
            return;
        }
        $(e.target).selectpicker('refresh');
        var $target = $(e.target).parent().parent();
        $target.children('div.color-name').children('span.value').html(color.name);
        $target.children('div.color-rgb').children('span.value').html(color.rgb.join(', '));
        $target.children('div.color-lab').children('span.value').html(color.lab.join(', '));
        $target.children('div.color-hlc').children('span.value').html(color.hlc.join(', '));
        $target.children('div.color-cmyk').children('span.value').html(color.cmyk.join(', '));
        $target.children('div.color-hex').children('span.value').html(color.hex.replace('#', ''));
        $target.children('div.color-lvr').children('span.value').html(color.lvrNumeric);
        var colorText = palette.colors[parseInt($textColor.val())], colorBg = palette.colors[parseInt($bgColor.val())];
        updateHistory();
        if (colorText && colorBg && typeof colorText.lvrNumeric === "number" && typeof colorBg.lvrNumeric === "number") {            
            var contrast = getContrastDifference(colorText.lvrNumeric, colorBg.lvrNumeric), min, max, closestColors;
            $('#preview > div > div').css('color', colorText.hex);
            $('#preview').css('background-color', colorBg.hex);
            if(contrast < 70) {
                $('#contrast').html(getBadContrastCaption(contrast));
                $('#comment').html(lang.comment);
                $('#closestCaption').html(lang.closestCaption);

                min = getSmalestContrast(colorBg.lvrNumeric);
                max = getBiggestContrast(colorBg.lvrNumeric);
                closestColors = palette.colors.filter(function(c){
                    return (c.lvrNumeric <= min || c.lvrNumeric >= max) && typeof c.lvrNumeric === "number";
                }).sort(function(a, b){
                    return compareDistance(a.rgb, b.rgb, colorBg.rgb);
                }).slice(0, 3);
                updateClosestColors(true, closestColors);

                min = getSmalestContrast(colorText.lvrNumeric);
                max = getBiggestContrast(colorText.lvrNumeric);
                closestColors = palette.colors.filter(function(c){
                    return (c.lvrNumeric <= min || c.lvrNumeric >= max) && typeof c.lvrNumeric === "number";
                }).sort(function(a, b){
                    return compareDistance(a.rgb, b.rgb, colorBg.rgb);
                }).slice(0, 3);               
                updateClosestColors(false, closestColors);                                
            } else {
                $('#closestCaption').html('');
                $('#contrast').html(getGoodContrastCaption(contrast));
                $('#comment').html('');
                $('#closestText').html('');
                $('#closestBackground').html('');
            }     
        }
    }

    function onClosestClick(e) {
        var $target = $(e.target).parent('.closest-block').length > 0 ? $(e.target).parent('.closest-block') : $(e.target);
        var id = $target.attr('data-id');
        var isText = $target.attr('data-is-text');
        $target = isText == 'true' ? $textColor : $bgColor;
        $target.selectpicker('val', id);
    }

    function updateClosestColors(isText, colors) {
        var closestColors = colors.map(function(c){
            return getClosestColorButton(isText, c.id, c.hex, c.code, c.lvrNumeric);
        }).join('');
        if(isText) {
            $('#closestText').html('<div class="closest-caption">' + lang.text + '</div>' + closestColors);
        } else {
            $('#closestBackground').html('<div class="closest-caption">' + lang.background + '</div>' + closestColors);
        }
        $('.closest-block').on('click', onClosestClick);
    }

    function getContrastDifference(colorA, colorB) {
        return colorA > colorB 
            ? Math.round((colorA - colorB) * 100 / colorA) 
                : Math.round((colorB - colorA) * 100 / colorB);
    }

    function getSmalestContrast(color) {
        return Math.floor(3 * color / 10);
    }

    function getBiggestContrast(color) {
        return Math.ceil(10 * color / 3);
    }

    function colorDistance(colorA, colorB) {
        var rmean = (colorA[0] + colorB[0]) / 2;
        var r = colorA[0] - colorB[0];
        var g = colorA[1] - colorB[1];
        var b = colorA[2] - colorB[2];
        //https://www.compuphase.com/cmetric.htm
        return Math.sqrt((((512+rmean)*r*r)/256) + 4*g*g + (((767-rmean)*b*b)/256));
    }

    function compareDistance(colorA, colorB, baseColor) {
        return colorDistance(colorA, baseColor) - colorDistance(colorB, baseColor);
    }

    function getParameterByName(name) {
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(window.location.href);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function updateHistory(palleteId, bgColorId, textColorId){
        var palleteId = parseInt($palettes.val()), bgColorId = parseInt($bgColor.val()), textColorId = parseInt($textColor.val());
        history.replaceState({}, null,
            "#/?palleteId=" + palleteId + "&bgColorId=" + bgColorId + "&textColorId=" + textColorId + "&lang=" + lang.short);
    }
});