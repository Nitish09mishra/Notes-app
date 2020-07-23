$("#search").click(function() {
    const value= $("#newList").val()
    $(this).attr("href", "/"+ value)
})