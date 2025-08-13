-- =====================================================
-- SCHEMA DO BANCO DE DADOS - CORRIDA APP
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    birth_date DATE,
    gender VARCHAR(20),
    weight DECIMAL(5,2), -- em kg
    height DECIMAL(5,2), -- em cm
    level INTEGER DEFAULT 1,
    total_distance DECIMAL(10,2) DEFAULT 0, -- em metros
    total_runs INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0, -- em segundos
    average_pace DECIMAL(8,2) DEFAULT 0, -- em segundos por km
    calories_burned INTEGER DEFAULT 0,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE AMIZADES
-- =====================================================
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, blocked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- =====================================================
-- TABELA DE CONVITES PARA CORRIDA
-- =====================================================
CREATE TABLE running_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    scheduled_time TIMESTAMP,
    distance DECIMAL(8,2), -- em km
    location_name VARCHAR(255),
    location_coordinates POINT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE SESSÕES DE CORRIDA
-- =====================================================
CREATE TABLE running_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    distance DECIMAL(10,2) DEFAULT 0, -- em metros
    duration INTEGER DEFAULT 0, -- em segundos
    average_pace DECIMAL(8,2) DEFAULT 0, -- em segundos por km
    average_speed DECIMAL(8,2) DEFAULT 0, -- em km/h
    max_speed DECIMAL(8,2) DEFAULT 0, -- em km/h
    calories INTEGER DEFAULT 0,
    steps INTEGER DEFAULT 0,
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,
    elevation_gain DECIMAL(8,2) DEFAULT 0, -- em metros
    elevation_loss DECIMAL(8,2) DEFAULT 0, -- em metros
    weather_conditions JSONB,
    is_public BOOLEAN DEFAULT true,
    is_group_run BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE PONTOS DA ROTA
-- =====================================================
CREATE TABLE route_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES running_sessions(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude DECIMAL(8,2),
    accuracy DECIMAL(8,2),
    speed DECIMAL(8,2),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE PARTICIPANTES DE CORRIDA EM GRUPO
-- =====================================================
CREATE TABLE group_run_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES running_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- active, left, finished
    final_distance DECIMAL(10,2),
    final_time INTEGER,
    UNIQUE(session_id, user_id)
);

-- =====================================================
-- TABELA DE SESSÕES DE MÚSICA
-- =====================================================
CREATE TABLE music_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    max_participants INTEGER DEFAULT 10,
    current_track_id VARCHAR(255),
    is_playing BOOLEAN DEFAULT false,
    current_time INTEGER DEFAULT 0, -- em segundos
    volume DECIMAL(3,2) DEFAULT 0.7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE PARTICIPANTES DE SESSÃO DE MÚSICA
-- =====================================================
CREATE TABLE music_session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES music_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    UNIQUE(session_id, user_id)
);

-- =====================================================
-- TABELA DE PLAYLISTS
-- =====================================================
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES music_sessions(id) ON DELETE CASCADE,
    track_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    duration INTEGER NOT NULL, -- em segundos
    url TEXT,
    artwork_url TEXT,
    genre VARCHAR(100),
    added_by UUID REFERENCES users(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    position INTEGER DEFAULT 0
);

-- =====================================================
-- TABELA DE CONQUISTAS
-- =====================================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(50), -- distance, speed, consistency, social, special
    progress INTEGER DEFAULT 0,
    target INTEGER NOT NULL,
    is_unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE NOTIFICAÇÕES
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- invite, achievement, friend_request, challenge, reminder
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE DESAFIOS
-- =====================================================
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- distance, time, pace, streak
    target_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE PARTICIPANTES DE DESAFIOS
-- =====================================================
CREATE TABLE challenge_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    progress DECIMAL(10,2) DEFAULT 0,
    rank INTEGER,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(challenge_id, user_id)
);

-- =====================================================
-- TABELA DE CONFIGURAÇÕES DO USUÁRIO
-- =====================================================
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notifications_invites BOOLEAN DEFAULT true,
    notifications_achievements BOOLEAN DEFAULT true,
    notifications_reminders BOOLEAN DEFAULT true,
    notifications_challenges BOOLEAN DEFAULT true,
    privacy_share_location BOOLEAN DEFAULT true,
    privacy_share_stats BOOLEAN DEFAULT true,
    privacy_show_online_status BOOLEAN DEFAULT true,
    units_distance VARCHAR(10) DEFAULT 'km', -- km, miles
    units_pace VARCHAR(15) DEFAULT 'min/km', -- min/km, min/mile
    units_temperature VARCHAR(10) DEFAULT 'celsius', -- celsius, fahrenheit
    music_auto_sync BOOLEAN DEFAULT true,
    music_default_volume DECIMAL(3,2) DEFAULT 0.7,
    music_allow_host_control BOOLEAN DEFAULT true,
    theme VARCHAR(10) DEFAULT 'auto', -- light, dark, auto
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_level ON users(level);

-- Índices para friendships
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Índices para running_sessions
CREATE INDEX idx_running_sessions_user_id ON running_sessions(user_id);
CREATE INDEX idx_running_sessions_start_time ON running_sessions(start_time);
CREATE INDEX idx_running_sessions_distance ON running_sessions(distance);

-- Índices para route_points
CREATE INDEX idx_route_points_session_id ON route_points(session_id);
CREATE INDEX idx_route_points_timestamp ON route_points(timestamp);

-- Índices para music_sessions
CREATE INDEX idx_music_sessions_host_id ON music_sessions(host_id);
CREATE INDEX idx_music_sessions_is_public ON music_sessions(is_public);

-- Índices para achievements
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_is_unlocked ON achievements(is_unlocked);

-- Índices para notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_running_invites_updated_at BEFORE UPDATE ON running_invites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_running_sessions_updated_at BEFORE UPDATE ON running_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_music_sessions_updated_at BEFORE UPDATE ON music_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular estatísticas do usuário
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas do usuário quando uma sessão é finalizada
    IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
        UPDATE users 
        SET 
            total_distance = total_distance + NEW.distance,
            total_runs = total_runs + 1,
            total_time = total_time + NEW.duration,
            average_pace = CASE 
                WHEN (total_distance + NEW.distance) > 0 
                THEN (total_time + NEW.duration) / ((total_distance + NEW.distance) / 1000)
                ELSE 0 
            END,
            calories_burned = calories_burned + NEW.calories,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar estatísticas
CREATE TRIGGER update_user_stats_trigger 
    AFTER UPDATE ON running_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- =====================================================
-- DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Inserir usuário admin de exemplo
INSERT INTO users (email, password_hash, name, username, level) 
VALUES ('admin@corridaapp.com', '$2b$10$example_hash', 'Admin', 'admin', 10)
ON CONFLICT (email) DO NOTHING;

-- Inserir configurações padrão para o admin
INSERT INTO user_settings (user_id) 
SELECT id FROM users WHERE email = 'admin@corridaapp.com'
ON CONFLICT (user_id) DO NOTHING; 