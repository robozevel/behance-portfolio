function injectAsyncScript(src) {
  let script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.body.appendChild(script);
}

function api(path, callback) {
  if (typeof callback !== 'function') throw new Error('nope');
  let url = 'https://www.behance.net/v2/' + path + '?api_key=TqPOMGWTaJTkjnN6E6dacZ7HYOtbJDCU';
  let q = encodeURIComponent('select * from html where url="' + url + '"');
  
  let callbackName = 'yql' + (Math.random() * Date.now()).toFixed(0);
  window[callbackName] = function(response) {
    window[callbackName] = null;
    let result = JSON.parse(response.query.results.body)
    if (result.http_code !== 200) throw new Error(result.http_code + ': ' + result.messages);
    callback(result);
  };

  injectAsyncScript('https://query.yahooapis.com/v1/public/yql?q=' + q + '&format=json&_maxage=3600&callback=' + callbackName);
}

let header = new Vue({
  el: 'header',
  mounted: function() {
    let backgroundImage = 'https://unsplash.it/' + this.$el.clientWidth + '/' + this.$el.clientHeight + '?image=1044';
    this.$el.style.backgroundImage = 'url(' + backgroundImage + ')';
  },
});

// start app
window.app = new Vue({
  el: '#gallery',
  data: {
    items: [],
    gallery: null,
  },
  methods: {
    openImage: function(item, event) {
      let parentNode = event.currentTarget.parentNode;
      this.gallery = new PhotoSwipe(document.querySelector('.pswp'), PhotoSwipeUI_Default, this.items, {
        index: this.items.indexOf(item),
        getThumbBoundsFn: function(index) {
          let thumbnail = parentNode.children[index];
          let pageYScroll = window.pageYOffset || document.documentElement.scrollTop
          let rect = thumbnail.getBoundingClientRect();
          return { x: rect.left, y: rect.top + pageYScroll, w: rect.width }
        },
        captionEl: false,
        fullscreenEl: false,
        history: false,
        shareEl: false,
        tapToClose: true
      });

      this.gallery.init();
    },
    loadProject: function(res) {
      res.project.modules.forEach(module => {
        if (module.type !== 'image') return;
        this.items.push({
          src: module.src,
          original: module.url,
          w: module.width,
          h: module.height
        });
      });
    },
    loadProjects: function(res) {
      res.projects.filter(project => ~project.fields.indexOf('Illustration')).forEach(project => {
        api('projects/' + project.id, app.loadProject); 
      });
    }
  }
});

api('users/klemantina9ca1/projects', app.loadProjects);