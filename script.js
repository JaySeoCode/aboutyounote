document.addEventListener('DOMContentLoaded', function() {
    // localStorage 초기화 여부 확인
    if (!localStorage.getItem('initialized')) {
        const defaultCategories = [
            { id: 1, name: "좋아하는 것", memos: [] },
            { id: 2, name: "싫어하는 것", memos: [] },
            { id: 3, name: "은근히 신경쓰는 것", memos: [] },
            { id: 4, name: "옷 사이즈", memos: [] },
            { id: 5, name: "가보고 싶은 장소", memos: [] },
            { id: 6, name: "견제해야 하는 이성", memos: [] },
            { id: 7, name: "못 먹는 것", memos: [] },
            { id: 8, name: "잘 먹는 것", memos: [] }
        ];
        
        // 기본 카테고리 저장
        localStorage.setItem('categories', JSON.stringify(defaultCategories));
        localStorage.setItem('initialized', 'true');
    }
    
    // 프로필 관련 요소들
    const profileUpload = document.getElementById('profile-upload');
    const profilePreview = document.getElementById('preview');
    const nameInput = document.getElementById('name');
    const birthdateInput = document.getElementById('birthdate');
    const phoneInput = document.getElementById('phone');
    const mbtiInput = document.getElementById('mbti');
    
    // 저장된 데이터 불러오기
    loadProfileData();
    loadCategories();
    
    // 프로필 이미지 변경 이벤트
    profileUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePreview.src = e.target.result;
                    profilePreview.style.opacity = '1';
                    localStorage.setItem('profileImage', e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                alert('이미지 파일만 업로드 가능합니다.');
            }
        }
    });

    // 프로필 정보 변경 이벤트들
    nameInput.addEventListener('change', saveProfileData);
    birthdateInput.addEventListener('change', saveProfileData);
    phoneInput.addEventListener('change', saveProfileData);
    mbtiInput.addEventListener('change', saveProfileData);

    // 카테고리 관련 코드...
    const addCategoryBtn = document.getElementById('add-category-btn');
    const categoriesContainer = document.getElementById('categories-container');
    let categoryId = document.querySelectorAll('.category').length + 1;

    addCategoryBtn.addEventListener('click', function() {
        const categoryName = prompt('새로운 카테고리 이름을 입력하세요:');
        if (categoryName && categoryName.trim() !== '') {
            const newCategory = createCategoryElement(categoryName.trim(), categoryId++);
            categoriesContainer.appendChild(newCategory);
            addDeleteButtonListener(newCategory);
            saveCategories();
        }
    });

    // 기존 카테고리들에 대한 삭제 버튼 리스너 추가
    document.querySelectorAll('.category').forEach(category => {
        addDeleteButtonListener(category);
    });
});

// 프로필 데이터 저장
function saveProfileData() {
    const profileData = {
        name: document.getElementById('name').value,
        birthdate: document.getElementById('birthdate').value,
        phone: document.getElementById('phone').value,
        mbti: document.getElementById('mbti').value
    };
    localStorage.setItem('profileData', JSON.stringify(profileData));
}

// 프로필 데이터 불러오기
function loadProfileData() {
    const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
    const profileImage = localStorage.getItem('profileImage');

    if (profileImage) {
        document.getElementById('preview').src = profileImage;
    }
    
    document.getElementById('name').value = profileData.name || '';
    document.getElementById('birthdate').value = profileData.birthdate || '';
    document.getElementById('phone').value = profileData.phone || '';
    document.getElementById('mbti').value = profileData.mbti || '';
}

// 카테고리 데이터 저장
function saveCategories() {
    const categories = [];
    document.querySelectorAll('.category').forEach(category => {
        const memos = [];
        category.querySelectorAll('.memo-item span').forEach(memo => {
            memos.push(memo.textContent);
        });
        
        categories.push({
            id: category.dataset.categoryId,
            name: category.querySelector('h3').textContent,
            memos: memos
        });
    });
    
    localStorage.setItem('categories', JSON.stringify(categories));
}

// 카테고리 데이터 불러오기
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const container = document.getElementById('categories-container');
    
    // 컨테이너 초기화
    container.innerHTML = '';
    
    // 카테고리 로드
    categories.forEach(category => {
        const categoryElement = createCategoryElement(category.name, category.id);
        container.appendChild(categoryElement);
    });
}

// 메모 추가 이벤트 리스너
document.addEventListener('keypress', function(e) {
    if (e.target.matches('.memo-input input') && e.key === 'Enter') {
        const input = e.target;
        const memoText = input.value.trim();
        
        if (memoText) {
            const memosList = input.closest('.category').querySelector('.memos');
            const memoItem = document.createElement('li');
            memoItem.className = 'memo-item';
            memoItem.innerHTML = `
                <span>${memoText}</span>
                <button class="delete-memo-btn">×</button>
            `;
            memosList.appendChild(memoItem);
            input.value = '';
            saveCategories();
        }
    }
});

// 메모 삭제 이벤트 위임
document.addEventListener('click', function(e) {
    if (e.target.matches('.delete-memo-btn')) {
        e.target.closest('.memo-item').remove();
        saveCategories();
    }
});

function createCategoryElement(name, id) {
    const div = document.createElement('div');
    div.className = 'category';
    div.dataset.categoryId = id;
    div.innerHTML = `
        <div class="category-title">
            <h3>${name}</h3>
            <button class="delete-category-btn" onclick="deleteCategory(this)">삭제</button>
        </div>
        <div class="memo-list">
            <div class="memo-input">
                <input type="text" placeholder="새로운 메모 추가">
            </div>
            <ul class="memos"></ul>
        </div>
    `;
    return div;
}

// 삭제 버튼 이벤트를 별도 함수로 분리
function deleteCategory(button) {
    if (confirm('이 카테고리를 삭제하시겠습니까?')) {
        const categoryElement = button.closest('.category');
        categoryElement.remove();
        saveCategories();
    }
}
