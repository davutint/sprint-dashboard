# SPRINT: AY 0 + AY 1 — Detaylı Uygulama Planı

> **Başlangıç:** 23 Mart 2026
> **Bitiş Hedefi:** 22 Nisan 2026 (30 gün)
> **Toplam Bütçe:** 50.000$ (Ay 0: 40.000$ + Ay 1: 10.000$)
> **Durum:** Devam Ediyor (P0-1 kod tamamlandı, test bekliyor)

### Kaynak Dokümanlar
> Bu sprint planı aşağıdaki Notion milestone dokümanlarından (`C:\Users\PC\Downloads\MILESTONES\`) türetilmiştir:
>
> **Ay 0 kaynağı:**
> - `Month 0 - QA Fixes Team Assigments Improvements Re...md` — Ana milestone (P0-1..P0-6, P0-R)
>   - Alt sayfalar: Passenger Randomization, Interaction Lock Problem, UI Clutter Problem,
>     Settings Save Problem, Collision & Physics Bugs, Tutorial & System Changes, Refactor
> - `UG QA Feedback Implementation...md` — ULG QA tester feedback (Rafal J, Kacper O, Michal K, Aleksandra M)
> - `ULG_QA_ANALIZ.md` (proje kök dizini) — 4 tester feedback'inin kümelenmiş analiz raporu
>
> **Ay 1 kaynağı:**
> - `Month 1 - Prison & Bribe Tagged NPC & AI Refactor...md` — Ana milestone (M1-G1..M1-G4)
>   - Alt sayfalar: Prison & Bribe EN, Tagged NPC System EN, AI Refactor EN
>
> **P0 madde ↔ Notion eşleşmesi:**
> | Sprint Maddesi | Notion Kaynak |
> |----------------|---------------|
> | P0-1 Yolcu Rastgeleliği | Passenger Randomization - EN |
> | P0-2 Cursor/ESC/Etkileşim | Interaction Lock Problem - EN |
> | P0-3 UI Bildirimleri | UI Clutter Problem - EN |
> | P0-4 Grafik Ayarları | Settings Save Problem - EN |
> | P0-5 Fizik/Çarpışma | Collision & Physics Bugs - EN |
> | P0-6 Tutorial & Rehberlik | Tutorial & System Changes - EN |
> | P0-R Refactor | Refactor - EN |
> | M1-G1 Hapishane Döngüsü | Prison & Bribe EN |
> | M1-G2 Guard AI | AI Refactor - EN |
> | M1-G3 Rüşvet/Yolsuzluk | Prison & Bribe EN |
> | M1-G4 Etiketli NPC | Tagged NPC System EN |

## Etiket Açıklamaları

| Etiket | Anlam |
|--------|-------|
| `[S]` | Küçük iş (1-2 gün) |
| `[M]` | Orta iş (3-5 gün) |
| `[L]` | Büyük iş (1+ hafta) |
| `[DEV]` | Unity'de sen yapacaksın (Inspector, sahne, test) |
| `[CLAUDE]` | Ben kod yazacağım |
| `[DESIGN]` | Game designer'dan karar/onay gerekiyor |
| `⚠️ RİSK` | Sorun çıkma olasılığı yüksek |
| `🔒 KARAR` | Devam etmeden önce karar verilmeli |

---

# ═══════════════════════════════════════════════
# HAFTA 1 — 23-29 MART — Temel Düzeltmeler
# ═══════════════════════════════════════════════

> **Hedef:** En küçük ve en bağımsız P0'ları bitir, büyük olanları başlat.
> **Biten maddeler:** P0-4, P0-6, P0-3 başlangıcı

---

## [S] P0-4) Grafik Ayarları Sorunu — 23 Mart ✅ TAMAMLANDI

> **Tamamlanma:** 23 Mart 2026
> **Kod değişikliği:** 0 — Tamamen Inspector işi

### Sorunun Kök Nedeni
UGO'nun 30 ayar component'inden 27'sinin `saveLoadController` alanı boş (null) bırakılmıştı.
UGO tasarımında bireysel ayarlar boş bırakılıp menü seviyesinde toplu yükleme yapılması öngörülmüş.
Ama bireysel ayarların `Start()` → `Load()` çağrısı menü yüklemesinden ÖNCE çalışıyor.
`saveLoadController` null olunca `GameSetting<T>.Load()` sessizce `defaultValue`'ya düşüyor.

Custom ayarlar (ses, fare, FOV) → Manager'lardan okuyarak çalışıyordu (tesadüfen).
UGO built-in ayarlar (fullscreen, çözünürlük, kalite vs.) → doğrudan default'a düşüyordu.

### Uygulanan Çözüm
Her bozuk ayar component'ine `PlayerPrefsSaveLoadController` eklendi (UGO'nun kendi sınıfı).
Her birine benzersiz key verildi. Her iki prefab'da aynı key'ler kullanıldı.

**Değiştirilen prefab'lar:**
- `Assets/_Prefabs/UGOGAMESAHNESI/GameOptionsMenu_InGame.prefab`
- `Assets/_Prefabs/UGOGAMESAHNESI/GameOptionsMenu_Mainmenu.prefab`

**Eklenen controller'lar (18 adet, her prefab'da):**

| GameObject | Key |
|-----------|-----|
| Resolution | `Setting_Resolution` |
| ScreenMode | `Setting_Fullscreen` |
| RefreshRate | `Setting_RefreshRate` |
| VSyncCount | `Setting_VSync` |
| TargetFrameRate | `Setting_FrameRate` |
| GraphicsQuality | `Setting_Quality` |
| TextureQuality | `Setting_Texture` |
| FogToggle | `Setting_Fog` |
| ShadowCascades | `Setting_ShadowCascade` |
| ShadowDistance | `Setting_ShadowDist` |
| Brightness | `Setting_Brightness` |
| AntiAliasingMode | `Setting_AntiAliasing` |
| Bloom | `Setting_Bloom` |
| ChromaticAberration | `Setting_Chromatic` |
| MotionBlurToggle | `Setting_MotionBlur` |
| GamepadInvert | `Setting_GamepadInvert` |
| GamepadSensitivity | `Setting_GamepadSens` |
| GamepadLookDeadzone | `Setting_GamepadDeadzone` |

**Dokunulmayan ayarlar (Manager pattern ile zaten çalışıyor):**
MasterVolume, SFXVolume, MusicVolume, AmbientVolume, MouseSensitivity, FOV, InvertYAxis, Language

### ✅ Test Sonucu (23 Mart)
- [x] Ayar değiştir → Play durdur/başlat → ayarlar korunuyor
- [x] New Game başlat → ayarlar sıfırlanmıyor

---

## [M] P0-6) Tutorial & Görsel Rehberlik — 24-27 Mart (4 gün)

> **Dosyalar:** `ToolOutlineManager.cs`, `QuestOutlineManager.cs`, `ToolHintManager.cs`

### 🔒 KARAR NOKTASI — Designer onayı gerekli
> Highlight rengi/stili ne olacak? Cursor hover ikonu ne olacak?
> **`[DESIGN]`** Game designer'dan referans görsel veya onay istenmeli.

### 24-25 Mart — Denetim + Standart
- [ ] `[CLAUDE]` Tüm IInteractable uygulayıcılarını tara — hangileri outline kullanıyor?
- [ ] `[CLAUDE]` Eksik olanların listesini çıkar (kapı, kimlik, bilgisayar, turnstile, masa)
- [ ] `[DEV]` Unity'de mevcut highlight'ları gözden geçir, eksikleri doğrula

### 26-27 Mart — Uygulama
- [ ] `[CLAUDE]` Tutarlı outline standardını tüm IInteractable'lara ekle
- [ ] `[CLAUDE]` Cursor hover değişimi ekle (el ikonu veya benzeri)
- [ ] `[CLAUDE]` Tutorial adımlarında hedef obje parıldama/yanıp sönme
- [ ] `[CLAUDE]` Yanlış eylemde 1 cümle düzeltici iç ses (`NarratorSystem` entegrasyonu)

### ✅ Test (27 Mart)
- [ ] `[DEV]` İlk 10 dakika oyun — "neye tıklayacağım?" anı var mı?
- [ ] `[DEV]` Kapı, kimlik, bilgisayar highlight oluyor mu?

---

## [M] P0-3) UI Bildirimleri — 26-29 Mart (4 gün)

> **Dosya:** `ToastManager.cs` (511 satır)
> **Not:** Mevcut sistemde zaten yığınlama + tekrar önleme var. Asıl iş konum değişikliği ve kategori ekleme.

### 🔒 KARAR NOKTASI — Designer onayı gerekli
> Toast'lar sağ üste mi, sol üste mi taşınacak? Kategori renkleri ne olacak?
> **`[DESIGN]`** Game designer'dan HUD yerleşim şeması istenmeli.

### 26-27 Mart — Konum + Kategori
- [ ] `[CLAUDE]` Toast anchor'unu merkez → sağ üst'e taşı
- [ ] `[CLAUDE]` Bildirim kategorileri ekle:
  - `Info` — kısa, 2sn otomatik kapanma, beyaz/mavi
  - `Warning` — 3-4sn, sarı/turuncu vurgu
  - `Critical` — manuel kapatma, kırmızı vurgu
- [ ] `[CLAUDE]` Aynı tür bildirimleri birleştir: "Yasak eşya (x3)"

### 28-29 Mart — HUD Düzeni
- [ ] `[CLAUDE]` Ekranın ortasını "temiz bölge" olarak koru — merkez popup'ları taşı
- [ ] `[CLAUDE]` HUD bilgi hiyerarşisi: birincil üst, ikincil köşe paneli
- [ ] `[DEV]` DamageNumbersPro popup konumlarını Unity'de kontrol et

### ✅ Test (29 Mart)
- [ ] `[DEV]` 3 bildirim aynı anda → üst üste binmiyor mu?
- [ ] `[DEV]` Ekranın ortası temiz mi?

---

## [S] P0-1) NPC Tekrar Sorunu — ✅ KOD TAMAMLANDI (24 Mart)

> **Sorun:** Testerlar aynı görünümlü NPC'lerin arka arkaya spawn olduğunu bildirdi.
> **Kök neden:** (1) DayConfig'de NPC isimleri hardcoded → her oynayışta aynı. (2) Random prefab seçiminde hafıza yok → aynı prefab arka arkaya gelebilir.
> **Dosya:** `NPCPoolManager.cs`, `NPCPrefabDatabase.cs`
>
> ~~**Eski plan (İPTAL):** SaveSeedGenerator, WeightedPassengerPool, hibrit mod — mevcut sistem zaten yeterli, bu overkill'di.~~

### ✅ 24 Mart — Cooldown Queue Sistemi `[CLAUDE]`
- [x] `[CLAUDE]` `NPCPoolManager`'a cooldown queue eklendi
  - Gender bazlı ayrı kuyruk (erkek/kadın)
  - Cooldown boyutu = `prefabCount - 1` → her prefab tüm tur bekler
  - Hard atanmış prefab'lar cooldown'a girmiyor
- [x] `[CLAUDE]` `NPCPrefabDatabase`'e `GetPrefabList(gender)` erişim metodu eklendi
- [x] `[CLAUDE]` `ReturnAllToPool()`'da cooldown temizleniyor (yeni gün = temiz başlangıç)

### ⏳ Test (DEV)
- [ ] `[DEV]` DayConfig'lerdeki hardcoded NPC isimlerini sil (auto-generate'e bırak)
- [ ] `[DEV]` Free loop'ta test → arka arkaya aynı prefab gelmiyor mu?
- [ ] `[DEV]` `showDebugMessages = true` ile Console'da cooldown loglarını kontrol et
- [ ] `[DEV]` Senaryolu günlerde hard atanmış prefab'lar bozulmamış mı?

---

## [L] P0-2) Cursor / ESC / Etkileşim Kilidi — ✅ KOD TAMAMLANDI (24 Mart)

> **Sorun:** İmleç kaybı, ESC tutarsızlığı, Alt+Tab sonrası bozulma. 5+ yama yapılmış, hiçbiri kalıcı olmamıştı.
> **Kök neden:** 4 bağımsız sistem (CursorManager, InteractionSystem ESC yığını, DeskFlowStateManager, DialogueCharacterController) birbirinden habersiz imleç/ESC yönetiyordu.
> **Karar:** Seçenek A — sıfırdan `InputStateManager` yazıldı (bilet/token tabanlı merkezi durum yönetimi)
> **Dosyalar:** `InputStateManager.cs` (YENİ), `InputState.cs` (YENİ) + 26 dosya geçirildi
> **Dokümanlar:** `INPUT_STATE_ANALYSIS.md`, `INPUT_STATE_MIGRATION.md`

### ✅ 23-24 Mart — Araştırma + Tasarım + Uygulama `[CLAUDE]`
- [x] `[CLAUDE]` 21 dosya analiz edildi — tüm imleç/ESC/girdi değişiklik noktaları satır numaralarıyla belgelendi
- [x] `[CLAUDE]` DEV ile doğrulama — deprecated kodlar, kullanılmayan scriptler, tasarım kararları
- [x] `[CLAUDE]` Durum geçiş haritası, kamera animasyonları, SetDialogueMode, UGO pause araştırıldı
- [x] `[CLAUDE]` InputStateManager tasarımı tartışıldı — bilet sistemi, Inherit katmanları, Alt+Tab koruması
- [x] `[CLAUDE]` `InputStateManager.cs` yazıldı (22 durum, bilet mekanizması, GetCurrentConfig ile taze Inherit çözümleme)
- [x] `[CLAUDE]` 26 dosya geçirildi (CursorManager/Push/Pop/SetDialogueMode → EnterState/ReleaseState)
- [x] `[CLAUDE]` Bug fix: HandleEscape token'ı ÖNCE çıkarır SONRA callback (eski pattern uyumu)
- [x] `[CLAUDE]` Bug fix: Inherit çözümleme ResolvedConfig yerine BASE config kullanır (Tutorial+Narrator aynı anda sorunu)
- [x] `[CLAUDE]` Bug fix: DeskFree Movement=Enabled (sınırlı fare bakışı çalışsın)

### ⏳ Test (DEV)
- [ ] `[DEV]` Masaya otur → belge incele → onay/ret → ayağa kalk
- [ ] `[DEV]` Masadayken telefon çalsın → yanıtla → narrator → ESC×2
- [ ] `[DEV]` Ayaktayken TAB menü → ESC kapat
- [ ] `[DEV]` Pazarlık → ESC iptal, kabul et
- [ ] `[DEV]` Alt+Tab: ayakta, masada, telefonda, menüde — her durumdan
- [ ] `[DEV]` ESC spam (10sn'de 30 basış) → sıkışma yok
- [ ] `[DEV]` Console'da hata/uyarı yok
- [ ] `[DEV]` Tutorial açık → narrator başlar → tutorial kapat → hareket geri geliyor mu?

---

### 📊 HAFTA 1 KONTROL NOKTASI (29 Mart Pazar)

| Madde | Durum |
|-------|-------|
| P0-1 (NPC Tekrar) | ✅ Kod bitti, DEV testi bekliyor |
| P0-4 (Ayarlar) | ✅ Bitti |
| P0-6 (Tutorial) | ⏳ Yapılacak |
| P0-3 (UI Toast) | ⏳ Yapılacak |
| P0-2 (ESC/Cursor) | ✅ Kod bitti, DEV testi bekliyor |
| P0-5 (Fizik) | ✅ Drug fix + zıplama bitti, duvar collider DEV'de, NPC clipping ertelendi |

---

# ═══════════════════════════════════════════════
# HAFTA 2 — 30 MART - 5 NİSAN — Büyük P0'ları Bitir
# ═══════════════════════════════════════════════

> **Hedef:** P0-1, P0-2, P0-5 tamamla. Ay 0 tamamen bitti sayılsın.

---

## ~~[L] P0-1) Yolcu Rastgeleliği~~ — ✅ BİTTİ (Hafta 1'de tamamlandı)

> Cooldown queue sistemi ile çözüldü. Seed/WeightedPool gerekmedi.
> Detaylar için Hafta 1 P0-1 bölümüne bak.

---

## ~~[L] P0-2) Cursor / ESC~~ — ✅ BİTTİ (Hafta 1'de tamamlandı)

> InputStateManager ile kökünden çözüldü. Eski ESC yığını, CursorManager kararları,
> SetDialogueMode flag'leri kaldırıldı. Bilet (token) sistemi Push/Pop eşleşme hatalarını
> yapısal olarak imkansız kıldı. Detaylar için Hafta 1 P0-2 bölümüne bak.

---

## [M] P0-5) Fizik / Çarpışma / Softlock — 1-5 Nisan (5 gün)

> **Dosyalar:** Prefab'lar, NavMesh, çeşitli controller'lar

### ✅ 24 Mart — Zıplama Yüksekliği (E1)
- [x] `[DEV]` Zıplama yüksekliği düzeltildi (test bekliyor)

### ✅ 24 Mart — Drug Havada Kalma (E2) `[CLAUDE]`
- [x] `[CLAUDE]` `DrugItemController.CanBeThrown => false` — drug fırlatılamaz
- [x] `[CLAUDE]` `EnhancedItemInspector.OnCancelPerformed`'da drug için RMB drop engeli (V5)
- [x] `[CLAUDE]` Drug'a özel hint array'leri — sadece "Inspect" + opsiyonel "Place" gösteriliyor
- **Kök neden:** Bavul itemlarından drop/throw kaldırılmıştı ama drug'a uygulanmamıştı. Oyuncu RMB ile drug'ı bırakınca havada asılı kalıyordu.
- **Çözüm:** Drop ve throw tamamen devre dışı bırakıldı — drug sadece confiscate edilmek için alınır.
- **Dosyalar:** `DrugItemController.cs`, `EnhancedItemInspector.cs`

### Duvar Collider Eksikliği (A5) — `[DEV]`
- [ ] `[DEV]` Tester videosundaki (t=1954, t=1979) bölgelerde collider kontrolü
- [ ] `[DEV]` Eksik duvar collider'larını düzelt

### NPC Kesişme (E4) — ⏳ AI Yol Haritasına Ertelendi
> NPC clipping sorunu NavMesh/avoidance ayarı gerektiriyor. M1-G2 (Guard AI) kapsamında veya
> sonraki AI geliştirme sprint'inde ele alınacak. Şimdilik ertelendi.

### ✅ Test (DEV)
- [ ] `[DEV]` Drug'ı E ile al → RMB bas → **elde kalmalı** (drop olmamalı)
- [ ] `[DEV]` Drug'ı E ile al → LMB bas → **throw charge başlamamalı**
- [ ] `[DEV]` Drug hint'lerinde sadece "R: Inspect" görünmeli
- [ ] `[DEV]` Drug'ı confiscation cabinet'e koy → **normal çalışmalı**
- [ ] `[DEV]` Bavul itemları hâlâ önceki gibi çalışmalı (regresyon yok)
- [ ] `[DEV]` Zıplama yüksekliği gercekçi hissediyor mu?

---

## [S] P0-R) Refactor — 4-5 Nisan (paralel, 2 gün)

- [ ] `[CLAUDE]` Deprecated kodları temizle (eski ToastNotificationManager vb.)
- [ ] `[CLAUDE]` `GameEventBus`'a yeni event yer tutucuları ekle:
  - Prison: `OnPrisonerCaseCreated`, `OnPrisonerResolved`
  - Corruption: `OnCorruptionChanged`, `OnAuditTriggered`
  - Directive: `OnDirectiveGenerated`, `OnDirectiveDisplayed`, `OnDirectiveCompleted`
- [ ] `[CLAUDE]` `NPCEntity`'ye `AffiliationTag` altyapısı hazırla (M1-G4 için)

---

### 📊 HAFTA 2 KONTROL NOKTASI (5 Nisan Pazar)

| Madde | Durum |
|-------|-------|
| P0-1 (NPC Tekrar) | ✅ Bitti (Hafta 1'de tamamlandı) |
| P0-2 (ESC/Cursor) | ✅ Kod bitti (Hafta 1'de), DEV testi bekliyor |
| P0-3 (UI Toast) | ⏳ Yapılacak |
| P0-4 (Ayarlar) | ✅ Bitti (Hafta 1'de tamamlandı) |
| P0-5 (Fizik) | ✅ Drug fix bitti, zıplama DEV halletti, duvar collider DEV'de, NPC clipping ertelendi |
| P0-6 (Tutorial) | ⏳ Yapılacak |
| P0-R (Refactor) | ⏳ Yapılacak |
| **AY 0 TAMAMLANDI** | ⏳ |

---

# ═══════════════════════════════════════════════
# HAFTA 3 — 6-12 NİSAN — Hapishane + Etiketli NPC
# ═══════════════════════════════════════════════

> **Hedef:** Ay 1'in veri modelleri + hapishane döngüsü + etiket sistemi.
> M1-G1 ve M1-G4 paralel başlar (bağımsız).

---

## [L] M1-G1) Hapishane Döngüsü — 6-12 Nisan (7 gün)

> **Dosyalar:** `JailController.cs` (493), `ArrestManager.cs` (573), `SecurityNPCController.cs`

### 6-7 Nisan — Veri Modeli + Save/Load
- [ ] `[CLAUDE]` `PrisonerCase` sınıfı oluştur:
  ```
  PassengerID (string)
  Name (string)
  ReasonType (enum): DocFraud / Contraband / Behavior
  RiskTier (enum): Low / Med / High
  Status (enum): Detained_PendingTransport / Transporting_ByGuard /
                  Transporting_FollowPlayer / InPrison / Resolved
  Mood (enum): Calm / Tense / Angry
  AffiliationTag (enum): None / Cartel / Government / VIP / Informant
  FollowUpHooks (List<string>)
  ```
- [ ] `[CLAUDE]` `JailController`'a `PrisonerCase` entegrasyonu
- [ ] `[CLAUDE]` `GameSaveData`'ya `List<PrisonerCase>` ekle + ES3 serialize
- [ ] `[DEV]` Save → Load → mahkum verileri korunuyor mu test et

### 8-9 Nisan — Taşıma Sistemi
**Dal A — Guard Eskort:**
- [ ] `[CLAUDE]` `ArrestManager`'a gerçek guard eskort akışı ekle:
  - En yakın hazır guard'ı seç
  - Guard mahkumu hapishane girişine eskort etsin
  - Mahkum guard'ı takip etsin (eskort state)
  - Guard tamamlayınca devriyeye dönsün
- [ ] `[CLAUDE]` Fail-safe: navigasyon timeout → mevcut teleport'a düş + debug log
- [ ] `[DEV]` Behavior Designer tree'de eskort node'larını test et

**Dal B — Oyuncu Takibi (güvenlik yoksa):**
- [ ] `[CLAUDE]` `NPCEntity`'ye `Transporting_FollowPlayer` state ekle
- [ ] `[CLAUDE]` Mahkum NavMesh ile oyuncuyu yakın mesafeden takip etsin
- [ ] `[CLAUDE]` Oyuncu giriş trigger'ına yaklaşınca mahkum girişe girsin
- [ ] `[CLAUDE]` Sıkışma timeout → girişe transfer (fail-safe)

### 9 Nisan — Hapishane Girişi
- [ ] `[CLAUDE]` Giriş trigger'ı: durum güncelle + deftere ekle + toast bildirimi
- [ ] `[CLAUDE]` `GameEventBus.OnNPCJailed` doğru tetiklensin
- [ ] `[CLAUDE]` Ruh hali otomatik atama (ağır kaçakçılık → Sinirli, hafif belge → Sakin)

### 10-12 Nisan — Hapishane Defteri UI ⚠️ RİSK
> UI işleri genelde tahmin edilenden uzun sürer.
- [ ] `[CLAUDE]` Defter panel prefab'ı script'i oluştur
- [ ] `[DEV]` Unity'de UI prefab oluştur (Canvas, ScrollRect, satır template)
- [ ] `[CLAUDE]` Liste görünümü: İsim/ID, Sebep ikonu, Durum, Ruh Hali
- [ ] `[CLAUDE]` Hover tooltip: ruh hali, sebep, risk, bağlılık
- [ ] `[CLAUDE]` Hızlı eylem menüsü:
  - **Para Cezası** — para kazan, mahkum serbest
  - **Serbest Bırak** — riski azalt
  - **Tut** — beklet (kapasite kullanır)
  - **Transfer** — başka yere gönder (Ay 3'te canlanacak)
- [ ] `[CLAUDE]` Her eylemin para/durum etkisi + önizleme
- [ ] `[CLAUDE]` Defter ESC handler entegrasyonu
- [ ] `[DEV]` Defter'in erişileceği fiziksel objeyi sahnede yerleştir

### ✅ Test (12 Nisan)
- [ ] `[DEV]` Tutukla → guard eskort → hapishane → deftere ekleniyor?
- [ ] `[DEV]` Guard yok → oyuncu takip → çalışıyor?
- [ ] `[DEV]` Defter eylemleri (ceza/serbest/tut) para + durum güncelleniyor?
- [ ] `[DEV]` Save/Load → mahkum verileri korunuyor?
- [ ] `[DEV]` Softlock yok? (mahkum sıkışmıyor, timeout çalışıyor)

---

## [M] M1-G4) Etiketli NPC Sistemi — 6-10 Nisan (5 gün, G1 ile paralel)

> **Dosya:** `NPCEntity.cs` (1.211 satır)
> **Not:** P0-R'de altyapı hazırlandı, burada tamamlanıyor.

### 6-7 Nisan — Veri Modeli
- [ ] `[CLAUDE]` `AffiliationTag` enum: None, Cartel, Government, VIP, Informant, Civilian
  - **KRİTİK:** Enum'un EN SONUNA ekleme kuralı!
- [ ] `[CLAUDE]` `ImportanceTier` enum: Low, Medium, High
- [ ] `[CLAUDE]` `NPCEntity`'ye alanlar ekle:
  - `_affiliationTag`, `_importanceTier`, `_followUpHooks`
- [ ] `[CLAUDE]` Public property'ler + `CleanNPC()` sıfırlama

### 8-9 Nisan — Etiket Atama + Gösterim
- [ ] `[CLAUDE]` `DayConfigSO` / `NPCSpawnData`'ya etiket alanı ekle
- [ ] `[CLAUDE]` `SmartNPCSpawner` dolgu NPC'lere rastgele etiket ata
  - Çoğunluk Civilian, gün ilerledikçe Cartel/Government oranı artar
- [ ] `[CLAUDE]` NPC info panelinde bağlılık etiketi göster
- [ ] `[CLAUDE]` Hapishane defterinde de etiket göster

### 10 Nisan — Save/Load + Gelecek Hazırlığı
- [ ] `[CLAUDE]` `GameSaveData`'ya etiket bilgisi ekle
- [ ] `[CLAUDE]` `FollowUpGenerator` iskelet interface oluştur (Ay 2 hazırlığı)
- [ ] `[CLAUDE]` `GameEventBus`'a Directive event'leri ekle

### ✅ Test (10 Nisan)
- [ ] `[DEV]` Etiketli NPC spawn → info panelinde etiket görünüyor?
- [ ] `[DEV]` Hapishane defterinde etiket görünüyor?
- [ ] `[DEV]` Save/Load → etiketler korunuyor?
- [ ] `[DEV]` `CleanNPC()` → etiket sıfırlanıyor?

---

### 📊 HAFTA 3 KONTROL NOKTASI (12 Nisan Pazar)

| Madde | Durum |
|-------|-------------|
| M1-G1 (Hapishane) | ⏳ Yapılacak |
| M1-G4 (Etiketli NPC) | ⏳ Yapılacak |
| M1-G2 (Guard AI) | ⏳ Hafta 4'te |
| M1-G3 (Rüşvet) | ⏳ Hafta 4'te |

---

# ═══════════════════════════════════════════════
# HAFTA 4 — 13-19 NİSAN — Rüşvet + Guard + Cila
# ═══════════════════════════════════════════════

> **Hedef:** Rüşvet/yolsuzluk sistemi + Guard AI iyileştirme + ortam cilası.

---

## [M] M1-G3) Rüşvet / Yolsuzluk Çekirdeği — 13-17 Nisan (5 gün)

> **Dosyalar:** `BargainSession.cs` (353), `MoralityManager.cs`, `ScoreManager.cs` (1.078)

### 🔒 KARAR NOKTASI
> Yeni `CorruptionManager` mı oluşturulacak, yoksa `MoralityManager` genişletilecek mi?
> **Öneri:** `MoralityManager`'ı genişlet — zaten itibar/yolsuzluk takibi var, yeni sınıf gereksiz karmaşıklık ekler.

### 13-14 Nisan — Birleşik Sonuç Çerçevesi
- [ ] `[CLAUDE]` `DecisionOutcomeProcessor` sınıfı oluştur:
  - `ApplyMoneyDelta()` — para değişimi
  - `ApplyCorruptionDelta()` — yolsuzluk değişimi
  - `TriggerEvents()` — denetim/guard şüphe tetikleme
  - `ExplanationLog()` — "neden oldu" açıklaması
- [ ] `[CLAUDE]` Kaçakçılık + rüşvet kararlarını bu pipeline'dan geçir
- [ ] `[CLAUDE]` `ScoreManager.HandleOutcomeSelected()` ile entegre et

### 15-16 Nisan — Rüşvet UI + Yolsuzluk Sayacı
- [ ] `[CLAUDE]` Rüşvet teklifi UI'ına ekle:
  - "Şimdi Kazan: +X₺" gösterimi
  - "Risk Etkisi: Yolsuzluk +Y" gösterimi
  - Mikro geri bildirim (ikon + ses) kabul/red anında
- [ ] `[CLAUDE]` `MoralityManager`'a yolsuzluk kademe sistemi ekle:
  - Düşük (0-33): Düşük denetim olasılığı
  - Orta (34-66): Ara sıra uyarı + denetim
  - Yüksek (67-100): Sık denetim, büyük ceza riski
- [ ] `[CLAUDE]` HUD'a yolsuzluk sayacı ekle (küçük ikon + ilerleme çubuğu)
- [ ] `[DEV]` Unity'de HUD'a yolsuzluk göstergesini yerleştir

### 17 Nisan — Açıklama Logu + Gün Sonu Raporu
- [ ] `[CLAUDE]` `DayEndReportData`'ya açıklama satırları listesi ekle
- [ ] `[CLAUDE]` Gün sonu raporunda tüm para hareketlerinin açıklaması:
  - "Rüşvet kabul: +500₺, Yolsuzluk: +15"
  - "Denetim cezası: -200₺"
- [ ] `[CLAUDE]` Save/Load sonrası yolsuzluk seviyesi korunması

### ✅ Test (17 Nisan)
- [ ] `[DEV]` Rüşvet kabul → para gelir + yolsuzluk artıyor?
- [ ] `[DEV]` Rüşvet red → itibar korunuyor?
- [ ] `[DEV]` Yolsuzluk yüksekken denetim olayı tetikleniyor?
- [ ] `[DEV]` Gün sonu raporu açıklama satırları doğru mu?
- [ ] `[DEV]` Save/Load → yolsuzluk korunuyor?

---

## [M] M1-G2) Guard Yapay Zekası — 13-16 Nisan (4 gün, G3 ile paralel)

> **Dosya:** `SecurityNPCController.cs`
> **Not:** Hafta 3'te hapishane döngüsü yazıldı, şimdi guard bunu kullanacak.

### 13-14 Nisan — Davranış Ağacı İyileştirme
- [ ] `[CLAUDE]` Mevcut Behavior Tree analiz: devriye, eskort, geçişler
- [ ] `[CLAUDE]` Guard mahkumu bırakıp devriyeye dönme davranışı
- [ ] `[CLAUDE]` Birden fazla tutuklama kuyruğu (guard meşgulken bekleme)
- [ ] `[CLAUDE]` Guard "hazır" durumu sorgulanabilir (`ArrestManager` erişimi)

### 15-16 Nisan — Tepki Sistemi (Temel)
- [ ] `[CLAUDE]` `GameEventBus.OnItemStolen` → guard farkındalık artışı
- [ ] `[CLAUDE]` Yolsuzluk seviyesi yüksek → guard şüphe davranışı (Ay 1: sadece gösterge)
- [ ] `[DEV]` Behavior Designer tree'de yeni node'ları test et

### ✅ Test (16 Nisan)
- [ ] `[DEV]` Devriye → tutuklama → eskort → devriye: sorunsuz döngü?
- [ ] `[DEV]` Guard meşgulken ikinci tutuklama → kuyruğe alınıyor?
- [ ] `[DEV]` Guard navigasyon fail-safe çalışıyor?

---

## [S] M1-G4b) Hapishane Ortam Cilası — 17-19 Nisan (3 gün)

> **Not:** Bu tamamen `[DEV]` tarafında, Unity sahnesi işi.

- [ ] `[DEV]` Hapishane alanı aydınlatma tutarlılığı
- [ ] `[DEV]` Obje yerleşimleri gözden geçir (boş/eksik alanlar)
- [ ] `[DEV]` Giriş/çıkış noktalarına görsel işaretler ekle
- [ ] `[DEV]` Guard devriye yolunun mantıklı görünmesini sağla
- [ ] `[DEV]` Defter erişim noktası (fiziksel bilgisayar veya pano) yerleştir

---

### 📊 HAFTA 4 KONTROL NOKTASI (19 Nisan Cumartesi)

| Madde | Durum |
|-------|-------------|
| M1-G2 (Guard AI) | ⏳ Yapılacak |
| M1-G3 (Rüşvet) | ⏳ Yapılacak |
| M1-G4b (Ortam Cilası) | ⏳ Yapılacak |
| **AY 1 TAMAMLANDI** | ⏳ |

---

# ═══════════════════════════════════════════════
# TAMPON — 20-22 NİSAN — Test + Düzeltme + Kapanış
# ═══════════════════════════════════════════════

> 3 gün tampon. Geciken işler, son testler, küçük düzeltmeler.

### 20 Nisan — Entegrasyon Testi
- [ ] `[DEV]` Tüm sistemleri birlikte test et:
  - NPC rastgele spawn → masaya gel → tutukla → guard eskort → hapishane → defter → eylem
  - Rüşvet kabul → yolsuzluk artsın → denetim tetiklensin
  - Etiketli NPC tutukla → defterde etiket görünsün
- [ ] `[DEV]` Save/Load entegrasyon testi:
  - Tüm yeni veriler (mahkum, etiket, yolsuzluk) korunuyor mu?
- [ ] `[DEV]` ESC/Cursor entegrasyon testi:
  - Defter açık + ESC → doğru kapanıyor mu?
  - Rüşvet UI + cursor → kaybolmuyor mu?

### 21 Nisan — Bug Fix
- [ ] `[CLAUDE]` Entegrasyon testinden çıkan bugları düzelt
- [ ] `[DEV]` Düzeltmeleri doğrula

### 22 Nisan — Kapanış
- [ ] `[DEV]` Son QA geçişi
- [ ] `[DEV]` Sprint durumunu game designer'a raporla
- [ ] TextTable hatırlatma (aşağıya bak)

---

# ═══════════════════════════════════════════════
# GENEL NOTLAR
# ═══════════════════════════════════════════════

## 30 Günlük Zaman Çizelgesi (Özet)

```
HAFTA 1 (23-29 Mart):  P0-4 ✅ | P0-1 ✅ kod | P0-2 ✅ kod | P0-5 ✅ drug fix + zıplama DEV
HAFTA 2 (30-5 Nisan):  P0-6 | P0-3 | P0-5 duvar collider DEV | P0-R → AY 0 BİTTİ
HAFTA 3 (6-12 Nisan):  M1-G1 | M1-G4 (paralel)
HAFTA 4 (13-19 Nisan): M1-G3 | M1-G2 | M1-G4b → AY 1 BİTTİ
TAMPON  (20-22 Nisan): Entegrasyon test + bug fix + kapanış
```

## Bağımlılık Haritası

```
P0-4 (Ayarlar) ──────────→ bağımsız, ilk bitirilecek
P0-6 (Tutorial) ─────────→ bağımsız
P0-3 (UI Toast) ─────────→ bağımsız
P0-1 (Rastgelelik) ──────→ bağımsız ──→ M1-G4 (etiket atama buna bağlı)
P0-2 (ESC/Cursor) ───────→ bağımsız ──→ M1-G1 (defter ESC) + M1-G3 (rüşvet UI)
P0-5 (Fizik) ────────────→ bağımsız ──→ M1-G1 (NPC takip fizik)

M1-G1 (Hapishane) ───────→ P0-2 + P0-5 bitmeli ──→ M1-G2 buna bağlı
M1-G4 (Etiketli NPC) ────→ P0-1 bitmeli
M1-G2 (Guard AI) ────────→ M1-G1 bitmeli
M1-G3 (Rüşvet) ──────────→ P0-2 bitmeli
M1-G4b (Ortam Cilası) ───→ M1-G1 bitmeli
```

## Yeni Oluşturulacak Dosyalar

| Dosya | Hafta | Sorumluluk |
|-------|-------|------------|
| ~~`SaveSeedGenerator.cs`~~ | ~~1~~ | ~~`[CLAUDE]`~~ İPTAL — gerek kalmadı |
| ~~`WeightedPassengerPool.cs`~~ | ~~1-2~~ | ~~`[CLAUDE]`~~ İPTAL — gerek kalmadı |
| ~~`PassengerProfileTag.cs`~~ | ~~1~~ | ~~`[CLAUDE]`~~ İPTAL — gerek kalmadı |
| `PrisonerCase.cs` | 3 | `[CLAUDE]` |
| `PrisonLedgerUI.cs` | 3 | `[CLAUDE]` + `[DEV]` UI prefab |
| `DecisionOutcomeProcessor.cs` | 4 | `[CLAUDE]` |
| `FollowUpGenerator.cs` | 3 | `[CLAUDE]` (iskelet) |

## Değiştirilecek Mevcut Dosyalar

| Dosya | Satır | Hafta | Değişiklik |
|-------|-------|-------|------------|
| ~~`SmartNPCSpawner.cs`~~ | ~~1.707~~ | ~~1-2~~ | ~~Hibrit mod + weighted pool~~ İPTAL — dokunulmadı |
| `NPCPoolManager.cs` | 773 | 1 | Cooldown queue sistemi ✅ |
| `NPCPrefabDatabase.cs` | 207 | 1 | GetPrefabList erişim metodu ✅ |
| `NPCEntity.cs` | 1.211 | 2-3 | AffiliationTag + FollowPlayer state |
| `JailController.cs` | 493 | 3 | PrisonerCase entegrasyonu |
| `ArrestManager.cs` | 573 | 3 | Guard eskort akışı |
| `SecurityNPCController.cs` | ~500 | 4 | BT iyileştirme + tepki |
| `ToastManager.cs` | 511 | 1 | Konum + kategori + birleştirme |
| `InteractionSystem.cs` | 722 | 2 | ESC yığını iyileştirme |
| `MoralityManager.cs` | ~200 | 4 | Yolsuzluk kademe sistemi |
| `ScoreManager.cs` | 1.078 | 4 | DecisionOutcomeProcessor entegrasyonu |
| `DayEndReportData.cs` | 142 | 4 | Açıklama satırları |
| `GameSaveData.cs` | ~300 | 3 | PrisonerCase + etiket (~~Seed~~ iptal) |
| `GameEventBus.cs` | ~800 | 2 | Yeni event'ler |
| `BargainSession.cs` | 353 | 4 | Rüşvet UI iyileştirme |
| `DrugItemController.cs` | ~443 | 1 | CanBeThrown => false (drop/throw devre dışı) ✅ |
| `EnhancedItemInspector.cs` | ~1500 | 1 | Drug RMB engeli + drug hint array'leri ✅ |
| `ToolOutlineManager.cs` | ~200 | 1 | Tutarlı highlight |
| `CheatPanel.cs` | — | 2 | Seed + yolcu üretme komutları |

## ⚠️ Risk Haritası

| Madde | Risk | Neden |
|-------|------|-------|
| P0-2 (ESC/Cursor) | ✅ Kod bitti | InputStateManager ile kökünden çözüldü, DEV testi bekliyor. |
| M1-G1 Defter UI | 🔴 Yüksek | UI işleri her zaman tahmin edilenden uzun sürer. |
| P0-1 (NPC Tekrar) | ✅ Çözüldü | Cooldown queue ile minimal değişiklik, SmartNPCSpawner'a dokunulmadı. |
| M1-G2 (Guard AI) | 🟡 Orta | Behavior Designer tree değişiklikleri kırılgan. |
| P0-5 (Fizik) | ✅ Drug fix bitti | Drug drop/throw devre dışı. Duvar collider DEV'de. NPC clipping AI sprint'ine ertelendi. |
| P0-4 (Ayarlar) | ✅ Çözüldü | PlayerPrefsSaveLoadController ile düzeltildi. |
| P0-6 (Tutorial) | 🟢 Düşük | Mevcut altyapı var, sadece tutarlılık. |

## 🔔 TextTable Hatırlatma (Sprint Sonunda)

Sprint boyunca şunlar değiştiyse, 22 Nisan'da yapılmalı:
- Yeni Toast mesajları → `Tools > Localization > Populate UI TextTable`
- Yeni enum değerleri (AffiliationTag, ReasonType vb.) → EnumLocalizer güncelle
- Yeni UI label/prompt → `Tools > Localization > Populate UI TextTable`
- Tamamlandıktan sonra: `Tools > Localization > Extract All TextTables to CSV`
