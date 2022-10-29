import songs from './listSongs.js';

var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MusicPlayer';

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
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const backwardBtn = $('.btn-backward');

const app = {
  currentIndex: 0,
  isPlaying: false,
  isMuted: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: songs,
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index === this.currentIndex ? 'active' : ''
        }" data-index="${index}">
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
    playlist.innerHTML = htmls.join('');
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
        _this.isMuted = !_this.isMuted;
        _this.setConfig('isMuted', _this.isMuted);
        player.classList.toggle('muted', _this.isMuted);
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
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToView();
    });
    // xử lí prev track
    prevSongBtn.addEventListener('click', function () {
      _this.isPlaying = false;
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToView();
    });

    // Xử lí random track
    randomBtn.addEventListener('click', function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randomBtn.classList.toggle('active', _this.isRandom);
    });
    // Xử lí repeat track
    repeatBtn.addEventListener('click', function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      repeatBtn.classList.toggle('active', _this.isRepeat);
    });
    // xử lí tắt mở âm thanh
    muteBtn.addEventListener('click', function () {
      _this.muteSong();
      _this.isMuted = !_this.isMuted;
      _this.setConfig('isMuted', _this.isMuted);
      player.classList.toggle('muted', _this.isMuted);
    });
    backwardBtn.addEventListener('click', function () {
      _this.currentIndex = 0;
      _this.loadCurrentSong();
      _this.render();
      audio.play();
    });

    //Xử lí next track khi ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextSongBtn.click();
      }
    };

    // lắng nghe action click vào playlist
    playlist.addEventListener('click', function (e) {
      const songNode = e.target.closest('.song:not(.active)');
      if (songNode || e.target.closest('.option')) {
        // Xử lí khi click vào song
        if (songNode) {
          songNode.classList.toggle('active');
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        // Xử lí khi click vào option
        if (e.target.closest('.option')) {
        }
      }
    });
  },
  scrollToView: function () {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  },
  loadCurrentSong: function () {
    heading.innerText = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
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
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (this.currentIndex === newIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  playRepeatSong: function () {
    this.loadCurrentSong();
  },
  muteSong: function () {
    audio.muted = !this.isMuted;
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
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();
    this.defineProperties();
    this.handleEvents();

    this.loadCurrentSong();

    this.render();

    repeatBtn.classList.toggle('active', this.isRepeat);
    randomBtn.classList.toggle('active', this.isRandom);
  },
};
app.start();
