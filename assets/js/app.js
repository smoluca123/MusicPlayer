import songs from './listSongs.js';

var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const muteBtn = $('.btn-speaker');
const nextSongBtn = $('.btn-next');
const prevSongBtn = $('.btn-prev');

const app = {
  currentIndex: 0,
  isPlaying: false,
  isMuted: false,
  songs: songs,
  render: function () {
    const htmls = this.songs.map((song) => {
      return `
        <div class="song">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
        `;
    });
    $('.playlist').innerHTML = htmls.join('');
  },
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Xử lí CD rotate
    const cdAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdAnimate.pause();

    // xử lí phóng to thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      //   console.log(scrollTop);
      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lí khi click play
    playBtn.addEventListener('click', function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    });
    // xử lí pause & play
    audio.onplay = function () {
      player.classList.add('playing');
      _this.isPlaying = !_this.isPlaying;
      cdAnimate.play();
    };
    audio.onpause = function () {
      player.classList.remove('playing');
      _this.isPlaying = !_this.isPlaying;
      cdAnimate.pause();
    };

    // Xử lí các phím tắt
    document.addEventListener('keydown', function (e) {
      //   console.log(e);
      if (e.key == 'Enter' || e.code == 'Space') {
        e.preventDefault();
        if (_this.isPlaying) {
          audio.pause();
        } else {
          audio.play();
        }
      }
      if (e.key == 'm' || e.code == 'KeyM') {
        _this.muteSong();
      }
      if (e.code == 'ArrowRight') {
        _this.rewind(5);
      }
      if (e.code == 'ArrowLeft') {
        _this.rewind(-5);
      }
      if (e.code == 'ArrowUp') {
        e.preventDefault();
        _this.volumeChange(0.1);
      }
      if (e.code == 'ArrowDown') {
        e.preventDefault();
        _this.volumeChange(-0.1);
      }
      return;
    });
    muteBtn.addEventListener('click', function () {
      _this.muteSong();
    });

    // xử lí duration - tiến trình hiện tại của audio
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // xử lí tua song
    progress.oninput = function () {
      const seekTime = audio.duration * (progress.value / 100);
      audio.currentTime = seekTime;
    };

    // xử lí next track
    nextSongBtn.addEventListener('click', function () {
      _this.isPlaying = false;
      _this.nextSong();
      audio.play();
    });
    prevSongBtn.addEventListener('click', function () {
      _this.isPlaying = false;
      _this.prevSong();
      audio.play();
    });
  },
  loadCurrentSong: function () {
    heading.innerText = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex <= 0) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  muteSong: function () {
    player.classList.toggle('muted');
    audio.muted = !this.isMuted;
    this.isMuted = !this.isMuted;
  },
  rewind: function (second) {
    audio.currentTime = audio.currentTime + second;
  },
  volumeChange: function (volume) {
    // audio.volume < 1 ? audio.volume + volume : (audio.volume = 1);
    // if (audio.volume < 1.1) {
    //   audio.volume + volume;
    // }
    audio.volume += volume;
    if (audio.volume > 1) {
      audio.volume = 1;
    }
    if (audio.volume < 0.1) {
      player.classList.add('muted');
      audio.volume = 0;
    } else {
      player.classList.remove('muted');
    }
  },

  start: function () {
    this.defineProperties();
    this.handleEvents();

    this.loadCurrentSong();

    this.render();
  },
};
app.start();
