jQuery(function($) {
    var $palettes = $('#palettes'),
        $textColor = $('#text').find('select.color-select'),
        $bgColor = $('#background').find('select.color-select'),
        palette = data[0];

    $palettes.on('changed.bs.select', onPaletteSelect);
    $textColor.on('changed.bs.select', onColorSelect);
    $bgColor.on('changed.bs.select', onColorSelect);    
    data.forEach(function(pal, i) {
        $palettes.append('<option value="' + i + '">' + pal.name + '</option>');
    });
    $palettes.selectpicker('refresh');
    $palettes.trigger('changed.bs.select');
    
    function onPaletteSelect(e) {
        palette = data[parseInt($palettes.val())];
        $textColor.html('');
        $bgColor.html('');
        palette.colors.forEach(function(item, i) {
            var value = '<option value="' + i + 
            '" data-content="<div class=\'select-color-option-block\'><div class= \'select-color-option-color\'style=\'background-color: '
             + item.hex + ';\'></div><div class=\'select-color-option-name\'>' + item.code + '</div></div>">Relish</option>';
            $textColor.append(value);
            $bgColor.append(value);
        });
        $textColor.trigger('changed.bs.select');
        $bgColor.trigger('changed.bs.select');
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
        if (colorText && colorBg && typeof colorText.lvrNumeric === "number" && typeof colorBg.lvrNumeric === "number") {            
            var value = getContrastDifference(colorText.lvrNumeric, colorBg.lvrNumeric), min, max, closestColors;
            $('#preview > div > div').css('color', colorText.hex);
            $('#preview').css('background-color', colorBg.hex);

            if(value < 70) {
                $('#contrast').html('Контраст ' + value + '%<span style=\'color: red; font-size: larger; margin-left: 5px;\'>☹</span>');
                $('#comment').html('Для кращої розпізнаваності зробіть контраст між тлом та текстом не менше 70%');
                $('#closestCaption').html('Найближчі контрастні кольори');

                min = getSmalestContrast(colorBg.lvrNumeric);
                max = getBiggestContrast(colorBg.lvrNumeric);
                closestColors = palette.colors.filter(function(c){
                    return (c.lvrNumeric <= min || c.lvrNumeric >= max) && typeof c.lvrNumeric === "number";
                }).slice(0, 3);
                updateClosestColors(false, closestColors);

                min = getSmalestContrast(colorText.lvrNumeric);
                max = getBiggestContrast(colorText.lvrNumeric);
                closestColors = palette.colors.filter(function(c){
                    return (c.lvrNumeric <= min || c.lvrNumeric >= max) && typeof c.lvrNumeric === "number";
                }).slice(0, 3);               
                updateClosestColors(true, closestColors);                                
            } else {
                $('#closestCaption').html('');
                $('#contrast').html('Контраст ' + value + '%');
                $('#comment').html('');
                $('#closestText').html('');
                $('#closestBackground').html('');
            }     
        }
    }

    function updateClosestColors(isText, colors) {
        var closestColors = colors.map(function(c){
            return '<div class="closest-block"><div class="closest-color" style="background-color: '
            + c.hex + '"></div><div class="closest-name">' + c.code
            + '</div><div class="closest-lvr">LVR ' + c.lvrNumeric + '</div></div>';
        }).join('');
        if(isText) {
            $('#closestText').html('<div class="closest-caption">Текст</div>' + closestColors);
        } else {
            $('#closestBackground').html('<div class="closest-caption">Тло</div>' + closestColors);
        }
    }

    function getContrastDifference(colorA, colorB) {
        if (colorA > colorB) {
            return Math.round((colorA - colorB) * 100 / colorA);
        } else {
            return Math.round((colorB - colorA) * 100 / colorB);
        }
    }

    function getSmalestContrast(color) {
        return Math.round(3 * color / 10);
    }

    function getBiggestContrast(color) {
        return Math.round(10 * color / 3);
    }
});