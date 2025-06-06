import { USER_POSTS_PAGE } from '../routes.js';
import { renderHeaderComponent } from './header-component.js';
import { posts, goToPage, user } from '../index.js';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { deletePost, likePost } from '../api.js';

export function renderPostsPageComponent({ appEl }, token) {
    let appHtml = '';

    if (posts.length > 0) {
        appHtml = posts
            .map((post, index) => {
                return `
          <div class="page-container">
            <div class="header-container"></div>
            <ul class="posts">

              <li class="post">
                <div class="post-header" data-user-id="${post.user.id}">
                    <div class="post-header__user">
                        <img src="${post.user.imageUrl}" class="post-header__user-image">
                        <p class="post-header__user-name">${post.user.name}</p>
                    </div>
                    
                    <img data-index="${index}" class="post-header__menu-btn" src="./assets/images/3dots.png">

                    <div id="menu-${index}" style="display: none;" class="post-header-menu">
                        <button data-index="${index}" class="post-header__delete">Удалить</button>
                    </div>
                </div>
                <div class="post-image-container">
                    <img class="post-image" src="${post.imageUrl}">
                </div>
                <div class="post-likes">
                    <button data-post-index="${index}" class="like-button">
                        <img src="./assets/images/${post.isLiked ? 'like-active.svg' : 'like-not-active.svg'}">
                    </button>
                    <p class="post-likes-text">
                        Нравится: <strong>${post.likes.length}</strong>
                    </p>
                </div>
                <p class="post-text">
                    <span class="user-name">${post.user.name}</span>
                    ${post.description}
                </p>
                <p class="post-date">
                    ${formatDistanceToNow(post.createdAt, { locale: ru })}
                </p>
              </li>

            </ul>
          </div>
        `;
            })
            .join('');
    } else {
        appHtml = `
          <div class="page-container">
            <div class="header-container"></div>
          </div>
        `;
    }

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
        element: document.querySelector('.header-container'),
    });

    for (let userEl of document.querySelectorAll('.post-header')) {
        userEl.addEventListener('click', () => {
            goToPage(USER_POSTS_PAGE, {
                userId: userEl.dataset.userId,
            });
        });
    }

    for (let btnElem of document.querySelectorAll('.like-button')) {
        btnElem.addEventListener('click', () => {
            const index = btnElem.dataset.postIndex;
            const img = btnElem.querySelector('img');
            const countLikesElem =
                document.querySelectorAll('.post-likes-text')[index];

            likePost({ token }, posts[index].id, posts[index].isLiked).then(
                (data) => {
                    posts[index].likes = data.likes;
                    posts[index].isLiked = data.isLiked;

                    if (posts[index].isLiked) {
                        img.src = './assets/images/like-active.svg';
                    } else {
                        img.src = './assets/images/like-not-active.svg';
                    }

                    countLikesElem.innerHTML = `Нравится: <strong>${posts[index].likes.length}</strong>`;
                },
            );
        });
    }

    for (let btnMenu of document.querySelectorAll('.post-header__menu-btn')) {
        btnMenu.addEventListener('click', (event) => {
            event.stopPropagation();

            const index = btnMenu.dataset.index;

            if (posts[index].user.id === user._id) {
                console.log('user confirm');

                const menu = document.getElementById(`menu-${index}`);
                menu.style.display =
                    menu.style.display === 'none' ? 'flex' : 'none';
            } else {
                console.log('user not confirm');
            }
        });
    }

    for (let btnDelete of document.querySelectorAll('.post-header__delete')) {
        btnDelete.addEventListener('click', (event) => {
            event.stopPropagation();

            if (user) {
                const index = btnDelete.dataset.index;
                const isConfirm = confirm('Вы подтверждаете удаление?');
                if (isConfirm) {
                    deletePost({ token }, posts[index].id);
                }
            }
        });
    }
}

{
    /* <button data-index="${index}" class="post-header__menu-btn">
                        Меню
                    </button> */
}
