$(document).ready(()=>{

	var render = function(html){
		$(".content").html(html); 
	}
	$.ajax(
		{
			url: "http://patrickmichaelsen.com/spotify/content/",
			data: {
				name: "content",
				my_item: "hello world"
			}, 
			type: "POST",
			success: (html)=>{
				render(html); 
		}});

	var name = "navigation";

	var render_navigation = function(html){
		$("."+name).html(html); 
	}
	$.ajax(
		{
			url: "http://patrickmichaelsen.com/spotify/"+name+"/",
			data: {
				name: name,
				location: "Home",
			}, 
			type: "POST",
			success: (html)=>{
				render_navigation(html); 
		}});
});
