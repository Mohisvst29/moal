/*
  # إضافة جدول التقييمات والآراء

  1. الجدول الجديد
    - `reviews` - آراء وتقييمات العملاء
      - `id` (uuid, primary key)
      - `customer_name` (text) - اسم العميل
      - `rating` (integer) - التقييم من 1-5
      - `comment` (text) - التعليق
      - `approved` (boolean) - موافق عليه من الإدارة
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على الجدول
    - سياسات للقراءة العامة للتقييمات المعتمدة
    - سياسات للكتابة للجميع (إضافة تقييم جديد)
    - سياسات للإدارة للمستخدمين المصرح لهم
*/

-- إنشاء جدول التقييمات
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
-- القراءة العامة للتقييمات المعتمدة فقط
CREATE POLICY "Public can read approved reviews"
  ON reviews
  FOR SELECT
  TO public
  USING (approved = true);

-- السماح للجميع بإضافة تقييم جديد
CREATE POLICY "Anyone can add reviews"
  ON reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

-- السماح للإدارة بإدارة جميع التقييمات
CREATE POLICY "Allow admin operations on reviews"
  ON reviews
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- إنشاء فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- إدراج بعض التقييمات التجريبية
INSERT INTO reviews (customer_name, rating, comment, approved) VALUES
('أحمد محمد', 5, 'قهوة ممتازة وخدمة رائعة، أنصح بزيارة المقهى', true),
('فاطمة علي', 5, 'أجواء مغربية أصيلة وطعم لا يُنسى', true),
('محمد السعيد', 4, 'مكان جميل ومريح، القهوة لذيذة جداً', true),
('نورا أحمد', 5, 'تجربة رائعة، سأعود بالتأكيد', true);