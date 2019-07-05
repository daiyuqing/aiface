//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    score:'',
    src: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=2537629903,2400247907&fm=27&gp=0.jpg',
    face:{},
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    var self=this;
    wx.chooseImage({
      success: res => {
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePaths[0], //选择图片返回的相对路径
          encoding: 'base64', //编码格式
          success: res => { //成功的回调
            // console.log('data:image/png;base64,' + res.data)
            self.setData({ src: 'data:image/png;base64,' + res.data })
            wx.request({
              method: 'POST',
              url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect', //仅为示例，并非真实的接口地址
              data: {
                "access_token": "24.786bd0ac15d45fb2b13c3977f3aac0a2.2592000.1564899556.282335-16719910",
                "image_type": "BASE64",
                'image':  res.data,
                "face_field": "age,beauty,expression,face_shape,gender,glasses,race,quality,eye_status,emotion,face_type"
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },
              success(res) {
                console.log(res.data)
                if(res.data.error_code==0){
                  self.setData({ face: res.data.result.face_list[0]})
                }else{
                  wx.showToast({
                    title: res.data.error_msg,
                  })
                }
                
              }
            })
          }
        })
      }
    })
  },
  onLoad: function () {
    wx.getUserInfo({
      success: function (res) {
        console.log(res)
      }
    })
  },
})
