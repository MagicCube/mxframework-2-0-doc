var mx = {}; mx.mxbuild = {}; mx.mxbuild.docs = {};

var $root = window.location.pathname;

$(function()
{
    var $txtKeyword = $("#txtKeyword");
    $txtKeyword.focusin(function()
    {
        _txtKeyword_focused = true;
        $txtKeyword.animate({ width: 320, opacity: 1 }, 200);
    }).focusout(function()
    {
        _txtKeyword_focused = false;
        $txtKeyword.animate({ width: 200, opacity: 0.5 }, 200);
    }).animate({ opacity: 0.5 }, 0);
    
    var searchBox = new mx.mxbuild.docs.SearchBox($txtKeyword);
    with (searchBox)
    {
        init();
    }
    
    $("iframe").load(function(e)
    {   
        var win = e.target.contentWindow;
        $(win).keydown(_onkeypress);
        
        if (win.location.pathname.startsWith($root))
        {
            var path = win.location.pathname.substr($root.length)
            window.location.hash = path;
        }
    });
    
    
    
    $(window).keydown(_onkeypress);
    
    var homePage = "html/allNamespaces.html";
    if (window.location.hash != null && window.location.hash.length > 1)
    {
        homePage = window.location.hash.substr(1);
    }
    $("iframe").attr("src", homePage);
});

function _onkeypress(e)
{
    if (e.altKey && e.ctrlKey && !_txtKeyword_focused)
    {
        if (e.keyCode == 83 || e.keyCode == 70)
        {
            $("#txtKeyword").focusin();
            $("#txtKeyword").focus();
        }
    }
}


var _txtKeyword_focused = false;
mx.mxbuild.docs.SearchBox = function($p_txtKeyword)
{
    var me = this;
    
    me.maxSuggestionCount = 10;
    me.suggestDelay = 200;
    
    var _$txtKeyword = $p_txtKeyword;
    var _$drpSuggestion = null;
    
    me.init = function()
    {
        _initTxtKeyword();
        _initDrpSuggestion();
    };
    
    var _suggestKeyword = null;
    me.doCheck = function()
    {
        var curKeyword = _$txtKeyword.val().toLowerCase();
        if (curKeyword != _suggestKeyword)
        {
            _suggestKeyword = curKeyword;
            me.suggest(_suggestKeyword);
        }
    };
    
    
    var _lastSuggestion = null;
    me.suggest = function(p_keyword)
    {
        _suggestKeyword = p_keyword;
        me.resetSuggestion();
        
        if (p_keyword == "")
        {
            me.hideSuggestion();
        }
        else
        {
            var k = p_keyword;
            var firstIndex = 0;
            if (_lastSuggestion != null && k.startsWith(_lastSuggestion.keyword))
            {
                firstIndex = _lastSuggestion.firstIndex;
            }
            
            _lastSuggestion = { keyword: k };
            
            for (var i = firstIndex; i < $_index.length; i++)
            {
                var item = $_index[i];
                var itemKeyPart = item.key.substr(0, k.length);
                
                if (k == itemKeyPart)
                {
                    if (_lastSuggestion.firstIndex == null)
                    {
                        _lastSuggestion.firstIndex = i;
                    }
                
                    me.appendSuggestion(item);
                    
                    if (me.getSuggestionCount() > me.maxSuggestionCount)
                    {
                        break;
                    }
                }
                else if (itemKeyPart.localeCompare(k) > 0)
                {
                    break;
                }
            }
            
            me.dropDownSuggestion();
        }
    };
    
    
    me.resetSuggestion = function()
    {
        _$drpSuggestion.empty();
    };
    
    me.appendSuggestion = function(p_item)
    {
        var $li = $("<li></li>");
        $li.attr("fullName", p_item.fullName);
        $li.attr("class", p_item.type);
        $li.attr("itemType", p_item.type);
        
        var startIndex = p_item.fullName.toLowerCase().indexOf(_suggestKeyword);
        $li.html(
            p_item.fullName.substr(0, startIndex) +
            "<b>" + p_item.fullName.substr(startIndex, _suggestKeyword.length) + "</b>" +
            p_item.fullName.substr(startIndex + _suggestKeyword.length)
        );
        _$drpSuggestion.append($li);
    };
    
    me.getSuggestionCount = function()
    {
        return _$drpSuggestion.children().length;
    };
    
    
    me.dropDownSuggestion = function()
    {
        if (me.getSuggestionCount() > 0)
        {
            if (_$drpSuggestion.children(".selected").length == 0)
            {
                _$drpSuggestion.children().first().addClass("selected");
            }
            _$drpSuggestion.show();
            _$drpSuggestion.css("min-width",  _$txtKeyword.width());    
        }   
        else
        {
            _$drpSuggestion.hide();
        } 
    };
    
    me.hideSuggestion = function()
    {
        _$drpSuggestion.fadeOut(200);
    };
    
    me.navigateTo = function(p_fullName, p_type, p_openInNewWindow)
    {
        var url = null;
        switch (p_type)
        {
            case "namespace":
                url = p_fullName.replace(/\./g, "/") + "/index.html";
                break;
            case "class":
                url = p_fullName.replace(/\./g, "/") + ".html";
                break;
            default:
                var i = p_fullName.lastIndexOf(".");
                url = p_fullName.substr(0, i).replace(/\./g, "/") + ".html";
                url += "#" + p_fullName.substr(i + 1);
                break;
        }
        
        url = "html/" + url;
        if (p_openInNewWindow)
        {
            window.open(url);
        }
        else
        {
            $("iframe").attr("src", url);
        }
    }
    
    
    function _initTxtKeyword()
    {
        _$txtKeyword.bind("focusin", _txtKeyword_focusin);
    }
    
    function _txtKeyword_focusin(e)
    {
        _$txtKeyword.bind("keydown", _txtKeyword_keydown);
        _$txtKeyword.one("focusout", _txtKeyword_focusout);
        _$txtKeyword.val(""); _suggestKeyword = "";
    }
        
    function _txtKeyword_focusout(e)
    {
        if (_keydownTimer != null)
        {
            window.clearTimeout(_keydownTimer);
        }
        _$txtKeyword.unbind("keydown", _txtKeyword_keydown);
        
        me.hideSuggestion();
        _$txtKeyword.val("");
    }
    
    
    var _keydownTimer = null;
    function _txtKeyword_keydown(e)
    {
        switch (e.keyCode)
        {
            case 38:
                var $selection = _$drpSuggestion.children(".selected");
                if ($selection.length == 1)
                {
                    $selection.removeClass("selected");
                    if ($selection.prev().attr("tagName") == "LI")
                    {
                        $selection.prev().addClass("selected");
                    }
                    else
                    {
                        _$drpSuggestion.children().last().addClass("selected");
                    }
                }
                else
                {
                    _$drpSuggestion.children().last().addClass("selected");
                }
                break;
            case 40:
                var $selection = _$drpSuggestion.children(".selected");
                if ($selection.length == 1)
                {
                    $selection.removeClass("selected");
                    if ($selection.next().attr("tagName") == "LI")
                    {
                        $selection.next().addClass("selected");
                    }
                    else
                    {
                        _$drpSuggestion.children().first().addClass("selected");
                    }
                }
                else
                {
                    _$drpSuggestion.children().first().addClass("selected");
                }
                break;
            case 27:
                if (_$drpSuggestion.css("display") == "block")
                {
                    me.hideSuggestion();
                }
                else
                {
                    _$txtKeyword.focusout();
                    _$txtKeyword.blur();
                }
                break;
            case 13:
                _$drpSuggestion.children(".selected").mousedown();
                break;
        }
    
        if (_keydownTimer != null)
        {
            window.clearTimeout(_keydownTimer);
        }
        window.setTimeout(me.doCheck, me.suggestDelay);
    }
    
    
    
    
    
    
    function _initDrpSuggestion()
    {
        _$drpSuggestion = $("<ul id='drpSuggestion' class='dropDown' style='display:none;'>");
        _$drpSuggestion.mousedown(_drpSuggestion_click);
        _$txtKeyword.parent().append(_$drpSuggestion);
    }
    
    function _drpSuggestion_click(e)
    {
        var $li = null;
        if (e.target.tagName == "LI")
        {
            $li = $(e.target);
        }
        else if (e.target.tagName == "B")
        {
            $li = $(e.target.parentNode);
        }
        else
        {
            return;
        }
        var fullName = $li.attr("fullName");
        me.navigateTo(fullName, $li.attr("itemtype"), e.shiftKey || e.ctrlKey);
    }
    
    return me;
};