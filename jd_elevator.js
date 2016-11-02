function getElemTop(elem){
  var sum=0;
  //循环:只要elem的offsetParent不是null
  while(elem.offsetParent!=null){
    //获得elem的offsetTop，累加到sum
    sum+=elem.offsetTop;
    //将elem改为其offsetParent
    elem=elem.offsetParent;
  }
  return sum;
}
var elevator={
  FHEIGHT:0,//楼层高度
  UPLEVEL:0,//亮灯范围的上限
  DOWNLEVEL:0,//亮灯范围的下限
  elemTops:[],//所有楼层的span距body顶部的高度
  spans:null,//保存楼层的span元素对象
  DISTANCE:0,//总距离
  DURATION:1000,//总时间
  STEPS:200,//步数
  interval:0,//
  step:0,//
  timer:null,
  moved:0,
  init:function(){
    //获得FHEIGHT:获取id为f1的元素的高+id为f1的元素的marginBottom
    this.FHEIGHT=
      parseFloat($("#f1").css("height"))+
      parseFloat($("#f1").css("marginBottom"));
    //计算UPLEVEL: (innerHeight-FHEIGHT)/2
    this.UPLEVEL=(innerHeight-this.FHEIGHT)/2;
    //计算DOWNLEVEL: UPLEVEL+FHEIGHT
    this.DOWNLEVEL=this.UPLEVEL+this.FHEIGHT;
    //获取每个class为floor的元素下的header下的直接子元素span，将结果保存在spans中
    this.spans=$(".floor>header>span");
    //遍历spans中每个span
    for(var i=0;i<this.spans.length;i++){
      //调用getElemTop方法，获得当前span距body顶部的距离，保存在elemTops中i位置
      this.elemTops[i]= getElemTop(this.spans[i]);
      }
    //为document绑定滚动事件为checkLight，提前绑定this
    document.bind("scroll",this.checkLight.bind(this));
    //为id为elevator的元素绑定鼠标进入事件:
    $("#elevator").bind("mouseover",
      function(e){
         //获得目标元素target
        var target=e.target;
        //如果target不是ul
        if(target.nodeName!="UL"){
          //如果target是a
          if(target.nodeName=="A"){
            //将target换成其父元素
            target=target.parentNode;
          }
          //在target下找a，保存在as中
          var as=target.$("a");
          //将as中第一个a隐藏
          as[0].css("display","none");
          //将as中第二个a显示
          as[1].css("display","block");
        }
      }
    );
    //为id为elevator的元素绑定鼠标移出事件:
    $("#elevator").bind("mouseout",
      function(e){
        //获得目标元素target
        var target=e.target;
        //如果target不是ul
        if(target.nodeName!="UL"){
          //如果target是a
          if(target.nodeName=="A"){
            //将target换成其父元素
            target=target.parentNode;
          }
          //在target下找第一个子元素a，获取其内容，转为整数，-1后，保存在变量i中
          var i=parseInt(
            target.$("a:first-child").innerHTML
          )-1;
          //如果spans中i位置的span不是hover时
          if(this.spans[i].className!="hover"){
            //在target下找a，保存在as中
            var as=target.$("a");
            //将as中第一个a显示
            as[0].css("display","block");
            //将as中第二个a隐藏
            as[1].css("display","none");
          }
        }
      }.bind(this)
    );
    //计算interval:
    this.interval=this.DURATION/this.STEPS;
    //为id为elevator的div绑定单击事件为move
    $("#elevator").bind(
      "click",this.move.bind(this));
  },
  checkLight:function(){
    //获得scrollTop: document.body.scrollTop
    var scrollTop=document.body.scrollTop;
    //找到id为elevator下的ul下的li，保存在变量lis中
    var lis=$("#elevator>ul>li");
    //遍历spans中每个span
    for(var i=0;i<this.spans.length;i++){
      //从elemTops中获得i位置的高度,保存在elemTop中
      var elemTop=this.elemTops[i];
      //在lis中i位置的li下找a，保存在as中
      var as=lis[i].$("a");
      //如果elemTop<=scrollTop+DOWNLEVEL
          //且elemTop>scrollTop+UPLEVEL
      if(elemTop<=scrollTop+this.DOWNLEVEL
          &&elemTop>scrollTop+this.UPLEVEL){
        //设置当前span的class为hover
        this.spans[i].className="hover";
        as[0].css("display","none");
        as[1].css("display","block");
      }else{//否则，就清除当前span的class
        this.spans[i].className="";
        as[0].css("display","block");
        as[1].css("display","none");
      }
    }
    //查找class为floor下的header下的class为hover的span,保存在span中
    var span=$(".floor>header>span.hover");
    //设置id为elevator的元素的display:
    $("#elevator").css("display",
      //如果span不是null,就显示,否则就隐藏
      (span!=null)?"block":"none");
  },
  move:function(e){//this->elevator
    if(this.timer==null){
      var target=e.target;//获得target
      if(target.className=="etitle"){
      //获得target的前一个兄弟的内容，转为浮点 数-1，保存在i
      var i=parseInt(
        target.previousElementSibling.innerHTML)-1;
      //获得scrollTop,保存在startTop中
      var startTop=document.body.scrollTop;
      //计算endTop: elemTops中i位置的值-UPLEVEL
      var endTop=this.elemTops[i]-this.UPLEVEL;
      //计算DISTANCE: endTop-startTop
      this.DISTANCE=endTop-startTop;
      //计算step:
      this.step=this.DISTANCE/this.STEPS;
      //启动周期性定时器,序号保存在timer中
      this.timer=setInterval(
        this.moveStep.bind(this),
        this.interval
      );
      }
    }
  },
  moveStep:function(){
    //让窗口滚动过一个step
    var scrollTop=document.body.scrollTop;
    window.scrollTo(0,scrollTop+this.step);
    this.moved++;
    if(this.moved==this.STEPS){
      clearInterval(this.timer);
      this.timer=null;
      this.moved=0;
    }
  }
}
elevator.init();