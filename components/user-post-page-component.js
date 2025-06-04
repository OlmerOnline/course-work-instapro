import { renderHeaderComponent } from './header-component.js';
import { posts } from '../index.js';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { likePost } from '../api.js';

export function renderUserPostsPageComponent({ appEl }, token) {
    window.scrollTo(0, 0);

    let appHtml = '';

    if (posts.length > 0) {
        appHtml = posts
            .map((post, index) => {
                return `
          <div class="page-container">
            <div class="header-container"></div>
            <ul class="posts">

              <li class="post">
                <div class="post-header post-header_user" data-user-id="${post.user.id}">
                    <img src="${post.user.imageUrl}" class="post-header__user-image">
                    <p class="post-header__user-name">${post.user.name}</p>
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
}
