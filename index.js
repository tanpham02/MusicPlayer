/*  
        * 1. Render songs
        * 2. Scroll top
        * 3. Play / pause / seek
        * 4. CD rotate
        * 5. Next / prev
        * 6. Random
        * 7. Next/ Repeat when ended
        * 8. Active song
        * 9. Scroll active song into view
        * 10. Play song when click   
    */



const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'vtaan_Music'

const cd = $('.cd');
const heading = $('header h2');
const cdThumd = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const volumeBtn = $('.btn.btn-volume')
const volumeInput = $('#volume-song');


const appSongs = {
    currentIndex: 0,
    isRepeat: false,
    isRandom: false,
    isPlaying: false,
    isMuted: false,


    //localStoragetương tự như sessionStorage, ngoại trừ việc mặc dù localStoragedữ liệu không có thời gian hết hạn,
        //nhưng sessionStoragedữ liệu sẽ bị xóa khi phiên trang kết thúc - tức là khi trang bị đóng. 
    // configs: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {}, // nếu trong localStorage không có thì mặc định nó sẽ lấy {}
    songs : [
        {
            name: 'Remember Me', 
            singer: 'Sơn Tùng MTP',
            path: './assets/music/Remember-Me-SlimV-2017-Mix-Son-Tung-M-TP-SlimV.mp3',
            image: './assets/image/rememberMe.jpg'
        },
        {
            name: 'Mẹ', 
            singer: 'Quách Been',
            path: './assets/music/Me-Quach-Beem.mp3',
            image: './assets/image/me.jpg'
        },
        {
            name: 'Ba Kể Con Nghe', 
            singer: 'Bé Candy Nguyễn',
            path: './assets/music/Ba-Ke-Con-Nghe-Be-Candy-Ngoc-Ha.mp3',
            image: './assets/image/ba.jpg'
        },
        {
            name: 'Go Away', 
            singer: 'Chayeol, Punch',
            path: './assets/music/Go-Away-Go-Away-Chanyeol-Punch.mp3',
            image: './assets/image/goAway.jpg'
        },
        {
            name: 'Vinh Quang Đang Chờ Ta', 
            singer: 'Soobin Hoàng Sơn',
            path: './assets/music/Vinh-Quang-Dang-Cho-Ta-SOOBIN-Rhymastic.mp3',
            image: './assets/image/vinhquangdangchota.jpg'
        },
        {
            name: 'Summer Time', 
            singer: 'K-391',
            path: './assets/music/Summertime-K-391.mp3',
            image: './assets/image/summerTime.jpg'
        },
        {
            name: 'My Love', 
            singer: 'Westlife',
            path: './assets/music/My-Love-Westlife.mp3',
            image: './assets/image/myLove.jpg'
        }
    ],
    // setConfigs(key, value) {
    //     this.configs[key] = value;
    //     localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.configs));
    // },
    render() {
        const htmls = this.songs.map((song, index) => {
            // index === this.currentIndex ? 'active' : '' -> khi  index == currentIndex thì sẽ add class active 
                // khi click nextBtn thì sẽ run nextSong() và this.currentIndex++, lúc đó currentIndex = 1
                    // index sẽ = 1, và nó sẽ add cho thằng có index = 1 class active
            return `    
            <div class="song ${index === this.currentIndex ? 'active' : '' }"  data-index="${index}"   >  
                <div class="thumb" style="background-image: url(${song.image})"></div>
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
        playlist.innerHTML = htmls.join(' ');
    },


    definePropertys() {
        Object.defineProperty(this, 'currentSong', {
            // configurable:  true, 2 này dùng để sữa lối khi không thể redefine
            // enumerable: true , 
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    loadCurrentSong() {
        heading.textContent = this.currentSong.name;;
        cdThumd.style.backgroundImage = ` url(${this.currentSong.image})` ;
        audio.src = this.currentSong.path;
    },
    

    handleEvents() {
        const _this = this;
        // xử lí xoay CD
        const cdThumbAnimate = cdThumd.animate([
                // keyFrame
            {transform: 'rotate(360deg)'}
        ], {
            // options style
            duration: 10000,    // 10s seconds
            iterations: Infinity // vô hạn
        });
        cdThumbAnimate.pause(); // lúc đầu nó không xoay
        
        
        
        const cdWidth = cd.offsetWidth;
        // Xử lí action cuộn trang, phóng to thu nhỏ CD
        document.onscroll = () =>{
            // một số browser không hỗ trợ windown.screent thì có thể dùng document.documentElement.scrollTop
            const scrollTop = window.screenY || document.documentElement.scrollTop; // sẽ chọn 1 trong 2 nếu 1 thằng nào đó không thực thi
            const newCdWidth = cdWidth - scrollTop ;    // khi cuộn thì scrollTop sẽ tăng dần lên, muốn có newWidth của cd thì sẽ lấy width hiện tại trừ cho scroll tăng dần,
                                                                // và gán dô 1 cái biến, biến đó mình sẽ set cho cái width của thằng newCdWidth                                            
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;    // vì nếu hành vi cuộn nhanh, sẽ không bắt kịp event, cùng có thể list dài, scrollTop sẽ
                                                    // lớn hơn cdWidth nó sẽ ra số âm

            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lí click Play, Pasue
        playBtn.onclick = () =>{

            // tư duy ->  bựa, code xấu
            if(appSongs.isPlaying) {
                audio.pause();
                
            } else {
                audio.play();
            }
        }  


        // khi song được play
        audio.onplay = function() {
            appSongs.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();  // khi play mới quay
        }

        // khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();     // khi pause thì dừng tại chỗ pause
        }


        
        // khi tiến độ bài hát thay đổi(seek)
        // ** set time của audio = max value của input là 100%
        // c1: 
        // audio.ontimeupdate = function() {
        //     if(audio.duration) {
        //         const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
        //         progress.value = progressPercent;
        //     }
        //     console.log(progress.value)
        // }
            // c2: 
            // Set max value when you know the duration
        audio.onloadedmetadata = function() {
            progress.max = audio.duration; 
            // gán giá trị max của input = tổng thời gian của audio 
                // không được chạy vượt qua max
        }

        // xử lí khi tua song
        // update audio position
        progress.onchange = function(e) {
            audio.currentTime = e.target.value;
            // khi input nghe được event thay đổi của nó
                // thì giá trị thay đổi đó sẽ được gán cho thời gian hiện tại của audio
        }
        //audio nghe được event thay đổi thời gian và nó chạy hàm below
        // update range input when currentTime updates
        audio.ontimeupdate = function() {
            progress.value = audio.currentTime;
            // và thời gian hiện tại của audio sẽ được gán ngược lại cho input để tiếp tục chạy
        }

        // xử lí next song
        nextBtn.onclick = function() {
            if(_this.isRandom == true) {
                _this.randomSongs();
            } else {
                _this.nextSong();
            }   
           audio.play();
           _this.render();
           _this.scrollToActiveSong();
        }

        // xử lí next song
        prevBtn.onclick = function() {
            if(_this.isRandom == true) {
                _this.randomSongs();
            } else {
                _this.prevSong()
            }
           audio.play();
           _this.render();
           _this.scrollToActiveSong();
        }

        // xử lí bật / tắt random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;   // gán lại cho isRandom = true
            randomBtn.classList.toggle('active', _this.isRandom); // vì đã gán = true nên lần đầu sẽ add class
            // khi _this.isRepeat = true thì nó sẽ add class
                // khi _this.isRepeat = fasle thì nó sẽ remove class                                                            
        }

        // xử lí  bật / tắt lặp lại song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;   // gán lại isRepeat = true
            repeatBtn.classList.toggle('active', _this.isRepeat); // vì đã gán = true nên lần đầu sẽ add class
            // khi _this.isRepeat = true thì nó sẽ add class
                // khi _this.isRepeat = fasle thì nó sẽ remove class
        }


        // xử lí  next song  khi audio ended
        audio.onended = function() {
            if(_this.isRepeat == true) {
                audio.play();
            } else {
                nextBtn.click();    
                // thay vì _this. method nextSong() thì ta cho browser tự bấm vào nextBtn 
                    //và nó chạy lên dòng 290 và chạy lại event nextBtn.onclick()
            }
        }
        
        // xử lí khi click vào song nào thì play song đó
            // nếu dùng attrinute onclick thì phải viết 1 func ở ngoài nên dùng cách này 
        playlist.addEventListener('click', function(evt) {
        // click vào mục tiêu nào sẽ console.log mục tiêu đó ra
        //     Method closet() trả về element, 1 là chính nó và 2 là thẻ cha của nó
            const songNode = evt.target.closest('.song:not(.active)')
            const option = evt.target.closest('.option')
            if(songNode || option) {
                // console.log(songNode.getAttribute('data-index')) 
                    // đã set attribute là data-index thì dùng cái bên dưới cho gắn gọn code(đặt attribute có ý đồ)
                    // console.log(songNode.dataset.index)


                if(option || !songNode) {
                    
                }

                // xử lí khi click vào song
                if(songNode) {
                    // _this.currentIndex = parseInt(songNode.dataset.index); // attribute sau khi lấy ra nó là dạng chain(chuỗi) nên cần convert number
                    _this.currentIndex = Number(songNode.dataset.index); // attribute sau khi lấy ra nó là dạng chain(chuỗi) nên cần convert number
                    //convert dùng cách nào cũng được
                    _this.loadCurrentSong();
                    _this.render();
                    _this.scrollToActiveSong();
                    audio.play();
                } 
            }
        })


        // xử lí mở tắt âm thanh
        volumeBtn.onclick = function() {
            _this.isMuted = !_this.isMuted;
            volumeBtn.classList.toggle('off-mute', _this.isMuted);

        }

        volumeBtn.onmousedown = function() {
            if(_this.isMuted == false ) {   // --> điều kiện ngược, error
                audio.muted = true;     // true là dissable volume
            } else {
                audio.muted = false; // false là enable volume
            }
        }

        // xử lí tăng / giảm volume  
        audio.onloadeddata = function() {
            volumeInput.max = audio.volume;
        }

        volumeInput.onchange = function(e) {
            audio.volume = e.target.value;
        }

        audio.onvolumechange = function() {
            volumeInput.value = audio.volume;
            _this.controlMuted();
        }
        
    },
    controlMuted() {
        if(audio.volume == 0) {
            volumeBtn.classList.add('off-mute')
        } else {
            volumeBtn.classList.remove('off-mute')
        }
    },
    
    nextSong() {    
        if(this.isRandom == false) {
            this.currentIndex++;
            if(this.currentIndex >= this.songs.length) {
                this.currentIndex = 0;
            }   
        } else {
            this.isRandom = true;
            this.randomSongs();
        }
        this.loadCurrentSong();
    },

    prevSong() {
        if(this.isRandom == false) {
            this.currentIndex--;
            if(this.currentIndex < 0 ) {
                this.currentIndex = this.songs.length - 1;
            }
        } else {
            this.isRandom == true;
            this.randomSongs();
        }
        this.loadCurrentSong();
    },

    randomSongs() {
        let randomSong;
        do{
            randomSong = Math.floor(Math.random() * this.songs.length);
        } while(randomSong === this.currentIndex)
        this.currentIndex = randomSong;
        this.loadCurrentSong();
    },
    // repeatSong() {   // thay vì đặt thêm method ta dùng play() lại
    //     audio.loop = true;
    //     this.loadCurrentSong();
    // },

    scrollToActiveSong() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 300);
    },
    

    main() {    
        //xử lí các sự kiện (dom events)
        this.handleEvents();
        
        // định nghĩa thuộc tính cho Object
        this.definePropertys();

        // load song hiện tại
        this.loadCurrentSong();

        
        //render ra danh sách song
        this.render();
        



    },
};
appSongs.main();