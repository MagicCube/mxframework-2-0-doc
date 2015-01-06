$(function()
{
    $("#hideOverrides").click(_toggleOverrides);
});


function _toggleOverrides(e)
{
    var action = $(e.target).attr("action");
    if (action == "hide")
    {
        $(e.target).attr("action", "show");
        $(e.target).text("显示基类中的成员");
        $("*[override=true]").hide();
    }
    else
    {
        $(e.target).attr("action", "hide");
        $(e.target).text("隐藏基类中的成员");
        $("*[override=true]").show();
    }
}