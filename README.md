# sisa_final_project

K-Moveの日本IT就職研修における最終チームプロジェクトです。

現在、チーム共通の開発環境を構築しています。

## 技術スタック

- バックエンド: Java 25, Spring Boot 4.1.x, Spring Data JPA, Lombok
- フロントエンド: React, Vite, Axios
- データベース: MySQL
- インフラ: Docker, Docker Compose, Nginx

## プロジェクト情報

- Spring Bootプロジェクト名（仮）: finalProject
- ベースパッケージ: com.sisa
- データベース名: final_project

## ローカル開発環境

Docker Composeを使用して、以下のサービスを起動します。

- nginx：画面とAPIへのリクエストを振り分け
- frontend：React / Viteの開発サーバー
- backend：Spring Bootアプリケーション
- mysql：MySQLデータベース

本構成はローカル開発用です。

### 必要なもの

- Git
- Docker Desktop、またはDocker EngineとDocker Compose
- このリポジトリへのアクセス権限

Dockerでビルド・実行する場合、ホスト側へのJDK・Node.js・MySQLのインストールは不要です。

IDEでのJava開発やローカルでのnpm操作を行う場合は、別途JDK 25・Node.js 24を用意してください。

以下のコマンドは、macOS・Linuxのターミナル、またはWindowsのGit Bashで実行します。

### 初回セットアップ

#### 1. リポジトリを取得する

```bash
git clone https://github.com/kho903/sisa_final_project.git
cd sisa_final_project
```

以降のコマンドは、特に指定がない限り、`compose.yaml`があるプロジェクトのルートディレクトリで実行してください。

#### 2. 環境変数を設定する

初回のみ、設定ファイルのひな形をコピーします。

```bash
cp .env.example .env
```

`.env`を開き、次の項目にそれぞれ異なるパスワードを設定してください。

- `MYSQL_PASSWORD`：アプリケーション用DBユーザーのパスワード
- `MYSQL_ROOT_PASSWORD`：MySQL管理者のパスワード

`.env`はGit管理対象外です。実際のパスワードは`.env.example`に記載しないでください。

#### 3. Dockerを起動して、全サービスを立ち上げる

Docker Desktopを使用する場合は、先にアプリを起動してください。

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

初回はイメージと依存ライブラリのダウンロードに時間がかかります。

起動後、以下の状態を確認してください。

| サービス | 確認する状態                                  |
| -------- | --------------------------------------------- |
| mysql    | healthy                                       |
| frontend | healthy                                       |
| backend  | Up。アプリケーションの準備完了は次のAPIで確認 |
| nginx    | Up                                            |

#### 4. API接続を確認する

```bash
curl -i http://localhost:28080/api/health
```

HTTPステータスが`200`で、レスポンスに`"status":"UP"`が含まれていれば正常です。

`groups`などの追加項目が含まれる場合もあります。

#### 5. ブラウザで画面を確認する

[http://localhost:28080](http://localhost:28080)を開きます。

「バックエンド接続確認」ボタンを押し、以下が表示されることを確認してください。

```text
API・DBの状態：UP
```

通常の開発・動作確認には、Nginx経由の`28080`番ポートを使用します。

## 接続先

以下は`.env.example`の初期値です。

| 用途                      | 接続先                                 |
| ------------------------- | -------------------------------------- |
| アプリケーション画面      | http://localhost:28080                 |
| Nginx経由のヘルスチェック | http://localhost:28080/api/health      |
| バックエンド直接確認      | http://localhost:28081/actuator/health |
| フロントエンド直接確認    | http://localhost:25173                 |
| ホスト側からのMySQL接続   | 127.0.0.1:23306                        |
| コンテナ間のMySQL接続     | mysql:3306                             |

MySQLの初期設定は以下のとおりです。

- データベース名：`final_project`
- アプリケーション用ユーザー：`final_user`
- パスワード：各自の`.env`に設定した`MYSQL_PASSWORD`

`25173`はフロントエンド単体の確認用です。
画面からのAPI接続確認には`28080`を使用してください。

ポート番号を`.env`で変更した場合は、アクセス先のポートも変更してください。

## リクエストの流れ

| リクエスト                | Nginxの転送先                  |
| ------------------------- | ------------------------------ |
| `/`および画面関連ファイル | `frontend:5173`                |
| `/api/health`             | `backend:8080/actuator/health` |
| その他の`/api/...`        | `backend:8080/api/...`         |

Axiosの共通設定は`frontend/src/api/client.js`にあります。

`baseURL`には`/api`を指定しています。
画面とAPIに同じオリジンでアクセスするため、通常の画面操作はNginx経由で行ってください。

一般のAPIでは、Nginxは`/api`を削除せず、そのままバックエンドに転送します。

## 日常の操作

| 操作                                 | コマンド                                    |
| ------------------------------------ | ------------------------------------------- |
| 起動                                 | `docker compose up -d`                      |
| ビルドして起動                       | `docker compose up -d --build`              |
| 状態確認                             | `docker compose ps`                         |
| 一時停止                             | `docker compose stop`                       |
| コンテナとネットワークを削除して終了 | `docker compose down`                       |
| 全サービスのログ確認                 | `docker compose logs --tail=100 -f`         |
| バックエンドのログ確認               | `docker compose logs --tail=100 -f backend` |
| Nginxのログ確認                      | `docker compose logs --tail=100 -f nginx`   |

ログ表示は`Ctrl + C`で終了できます。ログ表示を終了しても、コンテナは停止しません。

## コード・設定変更の反映

### フロントエンドのソース変更

次のファイル・ディレクトリはホストとコンテナを接続しています。

- `frontend/src/`
- `frontend/public/`
- `frontend/index.html`
- `frontend/vite.config.js`

ReactコンポーネントやCSSの変更は、通常、保存すると画面に反映されます。

### バックエンドの変更

Javaコード、リソース、Gradle設定などを変更した場合は、再ビルドしてください。

```bash
docker compose up -d --build backend
```

現在のバックエンド構成では、ソース変更は自動反映されません。

### フロントエンドの依存関係・ビルド設定の変更

`package.json`、`package-lock.json`、Dockerfile、ESLint設定などを変更した場合は、再ビルドしてください。

```bash
docker compose up -d --build frontend
```

### Nginx設定の変更

`nginx/default.conf`を変更した場合は、設定を検証してからコンテナを再作成します。

```bash
docker compose run --rm --no-deps nginx nginx -t
docker compose up -d --force-recreate nginx
```

### Compose・環境変数の変更

`compose.yaml`や`.env`を変更した場合は、次のコマンドで設定を反映します。

```bash
docker compose up -d --build
```

`docker compose restart`だけでは、Composeの環境変数やポート設定の変更は反映されません。

## フロントエンドのチェック

frontendコンテナが起動している状態で実行してください。

```bash
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

- `lint`：ESLintによるコード検査
- `build`：フロントエンドのビルド確認

これらはバックエンドのテストを実行するコマンドではありません。

## DBデータの取り扱い

MySQLのデータは、名前付きボリューム`mysql_data`に保存します。

通常の`docker compose down`では、このボリュームは削除されません。

- `docker compose down -v`はDBデータを含むボリュームを削除するため、通常の終了操作では使用しないでください。

DB名・ユーザー・パスワードの初期化は、データがない状態での初回起動時に行われます。
初期化後に`.env`のパスワードを書き換えても、既存のMySQLユーザーのパスワードは自動変更されません。

## 困ったとき

| 症状                                | 確認すること                                                  |
| ----------------------------------- | ------------------------------------------------------------- |
| Dockerに接続できない                | Docker Desktop、またはDocker Engineが起動しているか           |
| ポートが使用中と表示される          | `.env`の該当ポートを変更し、Composeで再作成する               |
| 初回起動直後に502が返る             | backend・frontendのログを確認し、起動完了後に再度アクセスする |
| 画面は表示されるがAPI確認に失敗する | `http://localhost:28080`からアクセスしているか                |
| DB認証に失敗する                    | 初回起動時に設定した認証情報と、現在の`.env`が一致しているか  |
| Javaコードの変更が反映されない      | backendイメージを再ビルドしたか                               |
