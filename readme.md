# zksync-mintsquare

### Для работы нужен NodeJS 19.8+

### В папке должна быть возможность делать запись временных файлов

Мы скачиваем рандом картинку с рандом текстом и заливаем на сервер MintSquare.

Также важно (!) в скрипте включена рандомная сортировка кошельков, учитывайте это.

Газ лимит считается по формуле estimate gas / 2. Можно изменить константу divider.

# Установка

```
git clone https://github.com/sm1ck/zksync-mintsquare.git
cd zksync-mintsquare
npm i
```

# Настройка

Приватники privates.txt

sleep_min sleep_max - задержки в секундах от и до

link - можно изменить адрес ноды zkSync

divider - делитель для экономии газа в zkSync

# Запуск

```
npm start
```
