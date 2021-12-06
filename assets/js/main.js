import songs from "./data.js";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

//Đóng mở menu trên mobile
const btnToggle = $(".sidebar_toggle");
const liElements = $$(".sidebar .nav__item");
let openSideBar = true;
btnToggle.onclick = function () {
  $(".sidebar").classList.toggle("active");
  if (openSideBar) {
    openSideBar = false;
    $(".sidebar_toggle > i").classList.remove("bx-chevron-right");
    $(".sidebar_toggle > i").classList.add("bx-chevron-left");
  } else {
    openSideBar = true;
    $(".sidebar_toggle > i").classList.add("bx-chevron-right");
    $(".sidebar_toggle > i").classList.remove("bx-chevron-left");
  }
};

//Thay đổi background li khi được chọn
liElements[1].classList.add("active");

liElements.forEach((elm) => {
  elm.onclick = function () {
    $(".sidebar .nav__item.active").classList.remove("active");
    this.classList.add("active");
  };
});

//Swiper JS
const swiperFirst = new Swiper("#js-swiper-first", {
  direction: "horizontal",
  loop: true,

  navigation: {
    nextEl: "#js-next-first",
    prevEl: "#js-prev-first",
  },
  slidesPerGroup: 5,
  slidesPerView: 5,
  breakpoints: {
    320: {
      slidesPerView: 1,
      slidesPerGroup: 1,
    },
    740: {
      slidesPerView: 2,
      slidesPerGroup: 2,
    },
    1024: {
      slidesPerGroup: 5,
      slidesPerView: 5,
    },
  },
});

const swiperSecond = new Swiper("#js-swiper-second", {
  direction: "horizontal",
  loop: true,

  navigation: {
    nextEl: "#js-next-second",
    prevEl: "#js-prev-second",
  },
  slidesPerView: 5,
  breakpoints: {
    320: {
      slidesPerView: 1,
    },
    740: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 5,
    },
  },
});

//Thêm vào list nhạc yêu thích
const hearts = $$(".bxs-heart");
hearts.forEach((heart) => {
  heart.onclick = function () {
    this.classList.toggle("active");
  };
});

//Chọn mục nghe nhạc
const controlItems = $$(".control-item");
controlItems[0].classList.add("active");
controlItems.forEach((item) => {
  item.onclick = function () {
    $(".control-item.active").classList.remove("active");
    this.classList.add("active");
  };
});

//Click nút để hiển thị playlist
const playListToggle = $(".bxs-playlist");
let isToggle = false;
playListToggle.onclick = function () {
  isToggle = !isToggle;
  $(".sidebar-sub").classList.toggle("active", isToggle);
  playListToggle.parentElement.parentElement.classList.toggle(
    "active",
    isToggle
  );
};

//Xử lý phần nghe nhạc
const PLAYER_STORAGE_KEY = "ZINGMP3_PLAYER";

const playList = $(".sidebar-scroll");
const player = $(".control");
const audio = $("#audio");
const songThumb = $("#player-song .song-thumb");
const progressSong = $("#progress-song");
const progressVolume = $("#progress-volume");

const playBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const volumeBtn = $("#btn-volume");

const app = {
  currentIndex: 0,
  currentVolume: 100,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  isFull: true,
  isFavorite: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = songs.map((song, index) => {
      return `
        <div class="media-item ${
          index === this.currentIndex ? "active" : ""
        }" data-index="${index}">
          <div class="media-left">
            <div class="song-thumb ${
              index === this.currentIndex ? "active" : ""
            }">
              <img src="${song.image}" alt="">
              <i class='bx bx-play'></i>
              <i class='bx bx-pause'></i>
            </div>
            <div class="song-infor">
              <span class="song-name">${song.name}</span>
              <span class="song-author">${song.singer}</span>
            </div>
          </div>
          <div class="media-right">
            <div class="control-item">
              <span>
                <i class='bx bx-heart'></i>
                <i class='bx bxs-heart'></i>
              </span>
            </div>
            <div class="control-item">
              <span>
                <i class='bx bx-dots-horizontal-rounded' ></i>
              </span>
            </div>
          </div>
        </div>
      `;
    });
    playList.innerHTML = htmls.join("");
    window.onload = function () {
      const songThumbActive = $(".sidebar-scroll .song-thumb.active");
      songThumbActive.classList.remove("active");
    };
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    const timeStart = $(".time-start");

    //Xủ lý quay/dừng CD
    const songThumbAnimate = songThumb.animate(
      [{ transform: "rotate(360deg)" }],
      {
        duration: 10000,
        iterations: Infinity,
      }
    );

    songThumbAnimate.pause();

    //xử lý khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    //khi nhạc đang chạy
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("active");
      songThumbAnimate.play();
      $$(".sidebar-scroll .song-thumb")[_this.currentIndex].classList.add(
        "active"
      );
    };

    //khi nhạc dừng
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("active");
      songThumbAnimate.pause();
      $$(".sidebar-scroll .song-thumb")[_this.currentIndex].classList.remove(
        "active"
      );
    };

    //khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progressSong.value = progressPercent;
        progressSong.style.background = `linear-gradient(90deg, #c662ef ${progressSong.value}%, #d3d3d3 ${progressSong.value}%)`;
        let timeCurrent = Math.floor(audio.currentTime);
        let secs = timeCurrent % 60;
        let mins = Math.floor(timeCurrent / 60);
        if (secs < 10) {
          secs = "0" + secs;
        }
        if (mins < 10) {
          mins = "0" + mins;
        }
        timeStart.textContent = mins + ":" + secs;
      }
    };

    //khi tua bài hát
    progressSong.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
      audio.play();
    };

    //khi chuyển bài hát
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
    };

    //khi lùi bài hát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
    };

    //khi random bài hát bất kỳ
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    //khi lặp lại một bài hát duy nhất
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    //khi bài hát kết thúc
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    //lắng nghe click vào playlist
    playList.onclick = function (e) {
      const songNode = e.target.closest(".media-item:not(.active)");
      const cdThumb = e.target.closest(".media-item.active .song-thumb");
      const optionNode = e.target.closest(
        ".media-item > .media-right > .control-item:last-child"
      );
      const favoriteNode = e.target.closest(
        ".media-item > .media-right > .control-item:first-child"
      );

      //xử lý khi click vào 1 bài hát
      if (songNode && !optionNode && !favoriteNode) {
        _this.currentIndex = +songNode.dataset.index;
        _this.loadCurrentSong();
        _this.render();
        audio.play();
      }

      //xử lý khi click vào mục option
      if (optionNode) {
        setTimeout(alert("Chức năng này tạm thời chưa có"), 1000);
      }

      //xử lý khi muốn nghe/dừng khi click vào ảnh ở playlist
      if (cdThumb) {
        if (cdThumb.classList.contains("active")) {
          cdThumb.classList.remove("active");
          audio.pause();
        } else {
          cdThumb.classList.add("active");
          audio.play();
        }
      }

      if (favoriteNode) {
        _this.isFavorite = !_this.isFavorite;
        favoriteNode.classList.toggle("active", _this.isFavorite);
        if (_this.isFavorite) {
          setTimeout(alert("Thêm vào bài hát ưa thích thành công"), 1000);
        }
        _this.setConfig("isFavorite", _this.isFavorite);
      }
    };

    //khi tăng giảm âm lượng
    progressVolume.onchange = function (e) {
      _this.currentVolume = e.target.value;
      audio.volume = _this.currentVolume / 100;
      if (audio.volume === 0) {
        volumeBtn
          .querySelector("#volume-full")
          .classList.remove("bx-volume-full");
        volumeBtn.querySelector("#volume-full").classList.add("bx-volume-mute");
      } else {
        volumeBtn.querySelector("#volume-full").classList.add("bx-volume-full");
        volumeBtn
          .querySelector("#volume-full")
          .classList.remove("bx-volume-mute");
      }
    };

    //khi nhấn vào để tắt âm lượng
    volumeBtn.onclick = function () {
      if (_this.isFull) {
        _this.isFull = false;
        volumeBtn
          .querySelector("#volume-full")
          .classList.remove("bx-volume-full");
        volumeBtn.querySelector("#volume-full").classList.add("bx-volume-mute");
        audio.volume = 0;
        progressVolume.value = 0;
      } else {
        _this.isFull = true;
        volumeBtn.querySelector("#volume-full").classList.add("bx-volume-full");
        volumeBtn
          .querySelector("#volume-full")
          .classList.remove("bx-volume-mute");
        audio.volume = _this.currentVolume / 100;
        progressVolume.value = _this.currentVolume;
      }
    };
  },
  loadCurrentSong: function () {
    const songImage = $("#player-song .song-thumb img");
    const songName = $("#player-song .song-name");
    const songAuthor = $("#player-song .song-author");
    const timeEnd = $(".time-end");
    songImage.src = this.currentSong.image;
    songName.textContent = this.currentSong.name;
    songAuthor.textContent = this.currentSong.singer;
    timeEnd.textContent = this.currentSong.time;
    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
    this.isFavorite = this.config.isFavorite;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = songs.length - 1;
    }
    this.loadCurrentSong();
  },
  randomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  startMusic: function () {
    //gán cấu hình từ config vào object
    this.loadConfig();
    //định nghĩa thuộc tính cho object
    this.defineProperties();
    //lắng nghe xử lý các sự kiện
    this.handleEvents();
    //tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();
    //render danh sách bài hát
    this.render();
    //hiển thị hành vi người dùng
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
    $$(
      ".sidebar-scroll .media-item > .media-right > .control-item:first-child"
    )[this.currentIndex].classList.toggle("active", this.isFavorite);
  },
};

app.startMusic();
