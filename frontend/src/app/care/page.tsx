'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Title,
  Card,
  Group,
  Text,
  Badge,
  Stack,
  Tabs,
  Table,
  ScrollArea,
  Box,
  Button,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Textarea,
  Checkbox,
  MultiSelect,
  Pill,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconEdit, IconCalendar, IconPill, IconWeight, IconShield, IconSettings, IconTrash, IconGripVertical } from '@tabler/icons-react';

// ケア記録の型定義
interface CareRecord {
  id: string;
  catId: string;
  catName: string;
  type: 'ワクチン' | '駆虫' | '健康診断' | '体重測定' | 'その他';
  date: string;
  description: string;
  nextDate?: string;
  status: '完了' | '予定' | '遅延';
  veterinarian?: string;
  notes?: string;
  tags: CareTag[]; // タグ情報を追加
}

// ケアタグの型定義
interface CareTag {
  id: string;
  name: string;
  category: 'body_part' | 'symptom' | 'treatment' | 'medication' | 'general';
  color: string;
  parentId?: string; // 階層構造用
}

// タグカテゴリの型定義
interface TagCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  order: number;
}

// ケア項目カテゴリの型定義
interface CareCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  order: number;
}

// ケア項目の型定義
interface CareItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  defaultInterval?: number; // デフォルト実施間隔（日）
  priority: '高' | '中' | '低';
  isRecurring: boolean; // 定期実施かどうか
  recordTemplate: CareRecordTemplate;
  alertDays?: number; // 何日前にアラートを出すか
  order: number;
}

// ケア記録テンプレートの型定義
interface CareRecordTemplate {
  requiredFields: string[]; // 必須入力項目
  optionalFields: string[]; // 任意入力項目
  numericFields: { name: string; unit: string; min?: number; max?: number }[]; // 数値入力項目
  selectFields: { name: string; options: string[] }[]; // 選択項目
  textFields: string[]; // 自由テキスト項目
}

// 病気・治療記録テンプレートの型定義
interface MedicalTemplate {
  id: string;
  name: string;
  description: string;
  category: 'disease' | 'treatment' | 'medication' | 'examination';
  fields: MedicalField[];
  suggestedTags: string[];
  followUpDays: number[];
  isActive: boolean;
}

interface MedicalField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'textarea';
  required: boolean;
  options?: string[];
  unit?: string;
  description?: string;
}

// 治療記録の型定義
interface TreatmentRecord {
  id: string;
  catId: string;
  catName: string;
  date: Date;
  diseaseName: string;
  affectedParts: string[];
  symptoms: string[];
  symptomDetails?: string;
  treatments: string[];
  hasVetVisit: boolean;
  vetDiagnosis?: string;
  treatmentResult: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  resultDetails?: string;
}

// 治療記録テンプレート設定の型定義
interface TreatmentTemplateSettings {
  mode: 'simple' | 'detailed' | 'custom';
  visibleFields: {
    diseaseName: boolean;
    affectedParts: boolean;
    symptoms: boolean;
    symptomDetails: boolean;
    treatments: boolean;
    hasVetVisit: boolean;
    vetDiagnosis: boolean;
    treatmentResult: boolean;
    resultDetails: boolean;
  };
}

// タグフォームのプロパティ
interface TagFormProps {
  initialData: CareTag | null;
  onSave: (data: { name: string; category: string; color: string }) => void;
  onCancel: () => void;
  tagCategories: TagCategory[];
}

// タグフォームコンポーネント
const TagFormModal: React.FC<TagFormProps> = ({ initialData, onSave, onCancel, tagCategories }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || 'body_part');
  const [color, setColor] = useState(initialData?.color || 'blue');

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      category,
      color
    });
  };

  return (
    <Stack gap="md">
      <TextInput
        label="タグ名"
        placeholder="例: 右目、鼻水、抗生物質"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        required
      />
      
      <Select
        label="カテゴリ"
        data={tagCategories.map(cat => ({ value: cat.id, label: cat.name }))}
        value={category}
        onChange={(value) => setCategory(typeof value === 'string' ? value as CareTag['category'] : 'body_part')}
        required
      />
      
      <Select
        label="色"
        data={[
          { value: 'blue', label: '青（部位）' },
          { value: 'red', label: '赤（症状）' },
          { value: 'green', label: '緑（治療）' },
          { value: 'purple', label: '紫（薬剤）' },
          { value: 'gray', label: 'グレー（一般）' },
          { value: 'orange', label: 'オレンジ' },
          { value: 'teal', label: 'ティール' },
          { value: 'pink', label: 'ピンク' }
        ]}
        value={color}
        onChange={(value) => setColor(value || 'blue')}
        required
      />

      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          {initialData ? '更新' : '作成'}
        </Button>
      </Group>
    </Stack>
  );
};

// 簡単記録ウィザードのプロパティ
interface QuickRecordWizardProps {
  step: number;
  data: {
    catId: string;
    catName: string;
    type: string;
    date: Date;
    description: string;
    tags: string[];
  };
  setData: React.Dispatch<React.SetStateAction<{
    catId: string;
    catName: string;
    type: string;
    date: Date;
    description: string;
    tags: string[];
  }>>;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  onCancel: () => void;
  availableTags: CareTag[];
  tagCategories: TagCategory[];
  isDataLoaded: boolean;
}

// 簡単記録ウィザードコンポーネント
const QuickRecordWizard: React.FC<QuickRecordWizardProps> = ({
  step,
  data,
  setData,
  onNext,
  onPrev,
  onSave,
  onCancel,
  availableTags,
  tagCategories: _tagCategories,
  isDataLoaded
}) => {
  const getTagSelectData = useCallback(() => {
    if (!availableTags || !Array.isArray(availableTags)) {
      return [];
    }
    return availableTags.map(tag => ({
      value: tag.id,
      label: tag.name
    }));
  }, [availableTags]);

  const canProceedToNext = () => {
    switch (step) {
      case 1:
        return data.catId && data.type;
      case 2:
        return data.description;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Stack gap="md">
      {step === 1 && (
        <>
          <Text size="sm" c="dimmed" mb="md">猫とケア種類を選択してください</Text>
          <Select
            label="猫選択"
            placeholder="ケアを実施する猫を選択"
            data={[
              { value: '1', label: 'レオ' },
              { value: '2', label: 'ルナ' },
              { value: '3', label: 'ミケ' },
              { value: '4', label: 'シロ' },
            ]}
            value={data.catId}
            onChange={(value) => {
              setData(prev => ({ 
                ...prev, 
                catId: value || '',
                catName: value ? ['レオ', 'ルナ', 'ミケ', 'シロ'][parseInt(value) - 1] : ''
              }));
            }}
          />
          <Select
            label="ケア種類"
            placeholder="実施したケアの種類を選択"
            data={[
              { value: 'ワクチン', label: 'ワクチン接種' },
              { value: '駆虫', label: '寄生虫駆除' },
              { value: '健康診断', label: '健康診断' },
              { value: '体重測定', label: '体重測定' },
              { value: 'その他', label: 'その他' },
            ]}
            value={data.type}
            onChange={(value) => setData(prev => ({ ...prev, type: value || '' }))}
          />
          <DatePickerInput
            label="実施日"
            placeholder="ケアを実施した日を選択"
            value={data.date}
            onChange={(value) => setData(prev => ({ ...prev, date: (value || new Date()) as Date }))}
          />
        </>
      )}

      {step === 2 && (
        <>
          <Text size="sm" c="dimmed" mb="md">ケアの詳細を入力してください</Text>
          <Card padding="sm" bg="gray.0" mb="md">
            <Text size="sm" fw={500}>
              {data.catName} - {data.type}
            </Text>
            <Text size="xs" c="dimmed">
              {data.date.toLocaleDateString()}
            </Text>
          </Card>
          <Textarea
            label="ケア内容"
            placeholder="具体的なケア内容を入力してください"
            value={data.description}
            onChange={(e) => setData(prev => ({ ...prev, description: e.currentTarget.value }))}
            rows={4}
            required
          />
        </>
      )}

      {step === 3 && (
        <>
          <Text size="sm" c="dimmed" mb="md">タグを選択して記録を完了してください</Text>
          <Card padding="sm" bg="gray.0" mb="md">
            <Text size="sm" fw={500}>
              {data.catName} - {data.type}
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              {data.date.toLocaleDateString()}
            </Text>
            <Text size="xs">
              {data.description}
            </Text>
          </Card>
          <MultiSelect
            label="関連タグ（オプション）"
            placeholder="症状、部位、治療内容などのタグを選択"
            data={isDataLoaded ? getTagSelectData() : []}
            value={data.tags}
            onChange={(value) => setData(prev => ({ ...prev, tags: value }))}
            searchable
            clearable
            description="後から同じ症状や部位で検索できるようになります"
          />
        </>
      )}

      <Group justify="space-between" mt="xl">
        <Group>
          {step > 1 && (
            <Button variant="outline" onClick={onPrev}>
              戻る
            </Button>
          )}
        </Group>
        
        <Group>
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          {step < 3 ? (
            <Button 
              onClick={onNext} 
              disabled={!canProceedToNext()}
            >
              次へ
            </Button>
          ) : (
            <Button onClick={onSave}>
              記録保存
            </Button>
          )}
        </Group>
      </Group>
    </Stack>
  );
};

// テンプレートフォームのプロパティ
interface TemplateFormProps {
  initialData: MedicalTemplate | null;
  onSave: (data: Partial<MedicalTemplate>) => void;
  onCancel: () => void;
  availableTags: CareTag[];
  tagCategories: TagCategory[];
}

// テンプレートフォームコンポーネント
const TemplateFormModal: React.FC<TemplateFormProps> = ({ initialData, onSave, onCancel, availableTags, tagCategories: _tagCategories }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<'disease' | 'treatment' | 'medication' | 'examination'>(
    initialData?.category || 'disease'
  );
  const [suggestedTags, setSuggestedTags] = useState<string[]>(initialData?.suggestedTags || []);
  const [followUpDays, setFollowUpDays] = useState<string>(
    initialData?.followUpDays.join(', ') || '3, 7, 14'
  );

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    const followUpDaysArray = followUpDays
      .split(',')
      .map(d => parseInt(d.trim()))
      .filter(d => !isNaN(d));

    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      suggestedTags,
      followUpDays: followUpDaysArray,
      fields: initialData?.fields || [], // 簡略化のため、既存フィールドをそのまま維持
      isActive: initialData?.isActive ?? true
    });
  };

  const getTagSelectData = () => {
    if (!availableTags || !Array.isArray(availableTags)) {
      return [];
    }
    return availableTags.map(tag => ({
      value: tag.id,
      label: tag.name
    }));
  };

  return (
    <Stack gap="md">
      <TextInput
        label="テンプレート名"
        placeholder="例: 上部呼吸器感染症、薬物治療記録"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        required
      />
      
      <Textarea
        label="説明"
        placeholder="このテンプレートの用途や対象となる症状・治療について"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        rows={2}
      />
      
      <Select
        label="カテゴリ"
        data={[ 
          { value: 'disease', label: '病気・疾患' },
          { value: 'treatment', label: '治療・処置' },
          { value: 'medication', label: '薬物療法' },
          { value: 'examination', label: '検査' }
        ]}
        value={category}
        onChange={(value) => setCategory(typeof value === 'string' ? value as MedicalTemplate['category'] : 'disease')}
        required
      />
      
      <MultiSelect
        label="推奨タグ"
        placeholder="このテンプレートでよく使われるタグを選択"
        data={getTagSelectData()}
        value={suggestedTags}
        onChange={setSuggestedTags}
        searchable
        clearable
        description="記録時に自動で提案されるタグです"
      />

      <TextInput
        label="経過観察日数"
        placeholder="3, 7, 14"
        value={followUpDays}
        onChange={(e) => setFollowUpDays(e.currentTarget.value)}
        description="カンマ区切りで日数を入力（例: 3, 7, 14）"
      />

      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          {initialData ? '更新' : '作成'}
        </Button>
      </Group>
    </Stack>
  );
};

// 治療記録フォームのプロパティ
interface TreatmentRecordFormProps {
  settings: TreatmentTemplateSettings;
  onSettingsChange: (settings: TreatmentTemplateSettings) => void;
  diseaseHistory: string[];
  availableTags: CareTag[];
  tagCategories: TagCategory[];
  treatmentResultOptions: { value: string; label: string }[];
  onSave: (data: TreatmentRecord) => void;
  onCancel: () => void;
}

// 治療記録フォームコンポーネント
const TreatmentRecordForm: React.FC<TreatmentRecordFormProps> = ({
  settings,
  onSettingsChange,
  diseaseHistory,
  availableTags,
  treatmentResultOptions,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<TreatmentRecord>>({
    catId: '',
    catName: '',
    date: new Date(),
    diseaseName: '',
    affectedParts: [],
    symptoms: [],
    symptomDetails: '',
    treatments: [],
    hasVetVisit: false,
    vetDiagnosis: '',
    treatmentResult: 'unknown',
    resultDetails: ''
  });

  const getTagSelectData = (category?: string) => {
    const tags = category 
      ? availableTags.filter(tag => tag.category === category)
      : availableTags;
    
    return tags.map(tag => ({
      value: tag.id,
      label: tag.name
    }));
  };

  const handleModeChange = (mode: 'simple' | 'detailed' | 'custom') => {
    let newVisibleFields = { ...settings.visibleFields };
    
    if (mode === 'simple') {
      newVisibleFields = {
        diseaseName: true,
        affectedParts: true,
        symptoms: true,
        symptomDetails: false,
        treatments: false,
        hasVetVisit: false,
        vetDiagnosis: false,
        treatmentResult: false,
        resultDetails: false
      };
    } else if (mode === 'detailed') {
      newVisibleFields = {
        diseaseName: true,
        affectedParts: true,
        symptoms: true,
        symptomDetails: true,
        treatments: true,
        hasVetVisit: true,
        vetDiagnosis: true,
        treatmentResult: true,
        resultDetails: true
      };
    }
    
    onSettingsChange({
      mode,
      visibleFields: newVisibleFields
    });
  };

  const handleSubmit = () => {
    const treatmentRecord: TreatmentRecord = {
      id: `treatment_${Date.now()}`,
      catId: formData.catId || '',
      catName: formData.catName || '',
      date: formData.date || new Date(),
      diseaseName: formData.diseaseName || '',
      affectedParts: formData.affectedParts || [],
      symptoms: formData.symptoms || [],
      symptomDetails: formData.symptomDetails,
      treatments: formData.treatments || [],
      hasVetVisit: formData.hasVetVisit || false,
      vetDiagnosis: formData.vetDiagnosis,
      treatmentResult: formData.treatmentResult || 'unknown',
      resultDetails: formData.resultDetails
    };
    
    onSave(treatmentRecord);
  };

  return (
    <Stack gap="md">
      {/* モード切り替えボタン */}
      <Group gap="xs" mb="md">
        <Text size="sm" fw={500}>入力モード:</Text>
        <Button.Group>
          <Button 
            size="xs" 
            variant={settings.mode === 'simple' ? 'filled' : 'outline'}
            onClick={() => handleModeChange('simple')}
          >
            簡易
          </Button>
          <Button 
            size="xs" 
            variant={settings.mode === 'detailed' ? 'filled' : 'outline'}
            onClick={() => handleModeChange('detailed')}
          >
            詳細
          </Button>
          <Button 
            size="xs" 
            variant={settings.mode === 'custom' ? 'filled' : 'outline'}
            onClick={() => handleModeChange('custom')}
          >
            カスタム
          </Button>
        </Button.Group>
      </Group>

      {/* 基本情報 */}
      <Group grow>
        <Select
          label="猫選択"
          placeholder="治療を受けた猫を選択"
          data={[
            { value: '1', label: 'レオ' },
            { value: '2', label: 'ルナ' },
            { value: '3', label: 'ミケ' },
            { value: '4', label: 'シロ' },
          ]}
          value={formData.catId}
          onChange={(value) => {
            setFormData(prev => ({ 
              ...prev, 
              catId: value || '',
              catName: value ? ['レオ', 'ルナ', 'ミケ', 'シロ'][parseInt(value) - 1] : ''
            }));
          }}
          required
        />
        <DatePickerInput
          label="治療日"
          placeholder="治療を実施した日"
          value={formData.date}
          onChange={(date) => setFormData(prev => ({ ...prev, date: (date || new Date()) as Date }))}
          required
        />
      </Group>

      {/* 病名（オートコンプリート） */}
      {settings.visibleFields.diseaseName && (
        <Select
          label="病名"
          placeholder="病名を入力または選択"
          data={diseaseHistory.map(disease => ({ value: disease, label: disease }))}
          value={formData.diseaseName}
          onChange={(value) => setFormData(prev => ({ ...prev, diseaseName: value || '' }))}
          searchable
          required
        />
      )}

      {/* 発現部位 */}
      {settings.visibleFields.affectedParts && (
        <MultiSelect
          label="発現部位"
          placeholder="症状が現れた部位を選択"
          data={getTagSelectData('body_part')}
          value={formData.affectedParts}
          onChange={(value) => setFormData(prev => ({ ...prev, affectedParts: value }))}
          searchable
          clearable
        />
      )}

      {/* 症状 */}
      {settings.visibleFields.symptoms && (
        <MultiSelect
          label="症状"
          placeholder="観察された症状を選択"
          data={getTagSelectData('symptom')}
          value={formData.symptoms}
          onChange={(value) => setFormData(prev => ({ ...prev, symptoms: value }))}
          searchable
          clearable
        />
      )}

      {/* 症状詳細 */}
      {settings.visibleFields.symptomDetails && (
        <Textarea
          label="症状詳細"
          placeholder="タグで表現できない症状の詳細を記入"
          value={formData.symptomDetails}
          onChange={(e) => setFormData(prev => ({ ...prev, symptomDetails: e.currentTarget.value }))}
          rows={2}
        />
      )}

      {/* 治療内容 */}
      {settings.visibleFields.treatments && (
        <MultiSelect
          label="治療内容"
          placeholder="実施した治療を選択"
          data={getTagSelectData('treatment')}
          value={formData.treatments}
          onChange={(value) => setFormData(prev => ({ ...prev, treatments: value }))}
          searchable
          clearable
        />
      )}

      {/* 獣医診療 */}
      {settings.visibleFields.hasVetVisit && (
        <>
          <Checkbox
            label="獣医診療を受けた"
            checked={formData.hasVetVisit}
            onChange={(e) => setFormData(prev => ({ ...prev, hasVetVisit: e.currentTarget.checked }))}
          />
          
          {formData.hasVetVisit && settings.visibleFields.vetDiagnosis && (
            <Textarea
              label="獣医診断結果"
              placeholder="獣医師による診断内容"
              value={formData.vetDiagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, vetDiagnosis: e.currentTarget.value }))}
              rows={2}
            />
          )}
        </>
      )}

      {/* 治療結果 */}
      {settings.visibleFields.treatmentResult && (
        <Select
          label="治療結果"
          data={treatmentResultOptions}
          value={formData.treatmentResult}
          onChange={(value) => setFormData(prev => ({ ...prev, treatmentResult: typeof value === 'string' ? value as TreatmentRecord['treatmentResult'] : 'unknown' }))}
        />
      )}

      {/* 結果詳細 */}
      {settings.visibleFields.resultDetails && (
        <Textarea
          label="結果詳細"
          placeholder="治療結果の詳細や経過について"
          value={formData.resultDetails}
          onChange={(e) => setFormData(prev => ({ ...prev, resultDetails: e.currentTarget.value }))}
          rows={2}
        />
      )}

      <Group justify="flex-end" mt="xl">
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!formData.catId || !formData.diseaseName}
        >
          治療記録保存
        </Button>
      </Group>
    </Stack>
  );
};

// 過去の病名履歴データ（オートコンプリート用）
const sampleDiseaseHistory: string[] = [
  '上部呼吸器感染症',
  '猫風邪',
  '結膜炎',
  '外耳炎',
  '膀胱炎',
  '尿路結石',
  '胃腸炎',
  '皮膚炎',
  '口内炎',
  '歯周病',
  '腎不全',
  '肝機能障害',
  '糖尿病',
  '甲状腺機能亢進症',
  '心疾患'
];

// 治療記録テンプレート設定のデフォルト値
const defaultTreatmentTemplateSettings: TreatmentTemplateSettings = {
  mode: 'detailed',
  visibleFields: {
    diseaseName: true,
    affectedParts: true,
    symptoms: true,
    symptomDetails: true,
    treatments: true,
    hasVetVisit: true,
    vetDiagnosis: true,
    treatmentResult: true,
    resultDetails: true
  }
};

// 治療結果の選択肢
const treatmentResultOptions = [
  { value: 'excellent', label: '完治・著効' },
  { value: 'good', label: '改善・有効' },
  { value: 'fair', label: '軽度改善' },
  { value: 'poor', label: '無効・悪化' },
  { value: 'unknown', label: '経過観察中' }
];

// サンプル病気・治療テンプレートデータ
const sampleMedicalTemplates: MedicalTemplate[] = [
  {
    id: 'template_1',
    name: '上部呼吸器感染症',
    description: '鼻水、くしゃみ、目やになどの症状を伴う感染症',
    category: 'disease',
    fields: [
      { id: 'symptoms', name: '症状', type: 'multiselect', required: true, 
        options: ['鼻水', 'くしゃみ', '目やに', '涙目', '発熱', '食欲不振', '元気消失'], 
        description: '観察された症状をすべて選択' },
      { id: 'severity', name: '重症度', type: 'select', required: true, 
        options: ['軽度', '中等度', '重度'], description: '症状の重症度を評価' },
      { id: 'temperature', name: '体温', type: 'number', required: false, 
        unit: '℃', description: '測定した体温（任意）' },
      { id: 'appetite', name: '食欲', type: 'select', required: false, 
        options: ['正常', '減退', '廃絶'], description: '食欲の状態' },
      { id: 'notes', name: '追加観察事項', type: 'textarea', required: false, 
        description: 'その他気になる症状や変化' }
    ],
    suggestedTags: ['sy1', 'sy6', 'sy2', 'sy3', 'sy14', 'sy9', 'sy16'],
    followUpDays: [3, 7, 14],
    isActive: true
  },
  {
    id: 'template_2',
    name: '薬物治療記録',
    description: '処方薬の投与記録と効果観察',
    category: 'medication',
    fields: [
      { id: 'medication_name', name: '薬剤名', type: 'text', required: true, 
        description: '処方された薬剤の名前' },
      { id: 'dosage', name: '用量', type: 'text', required: true, 
        description: '投与量（mg/kgなど）' },
      { id: 'frequency', name: '投与回数', type: 'select', required: true, 
        options: ['1日1回', '1日2回', '1日3回', 'その他'], description: '1日の投与回数' },
      { id: 'duration', name: '投与期間', type: 'number', required: true, 
        unit: '日', description: '予定投与日数' },
      { id: 'side_effects', name: '副作用', type: 'multiselect', required: false, 
        options: ['なし', '食欲不振', '嘔吐', '下痢', '眠気', 'その他'], description: '観察された副作用' },
      { id: 'effectiveness', name: '効果', type: 'select', required: false, 
        options: ['著効', '有効', '無効', '評価困難'], description: '治療効果の評価' }
    ],
    suggestedTags: ['md1', 'tr1', 'tr7'],
    followUpDays: [1, 3, 7],
    isActive: true
  },
  {
    id: 'template_3',
    name: '外科手術記録',
    description: '手術の記録と術後経過観察',
    category: 'treatment',
    fields: [
      { id: 'surgery_type', name: '手術種類', type: 'text', required: true, 
        description: '実施した手術の種類' },
      { id: 'anesthesia', name: '麻酔方法', type: 'select', required: true, 
        options: ['全身麻酔', '局所麻酔', 'その他'], description: '使用した麻酔方法' },
      { id: 'duration', name: '手術時間', type: 'number', required: false, 
        unit: '分', description: '手術にかかった時間' },
      { id: 'complications', name: '合併症', type: 'multiselect', required: false, 
        options: ['なし', '出血', '感染', '麻酔トラブル', 'その他'], description: '手術中・術後の合併症' },
      { id: 'recovery_notes', name: '回復状況', type: 'textarea', required: false, 
        description: '術後の回復状況や特記事項' }
    ],
    suggestedTags: ['tr5', 'tr7'],
    followUpDays: [1, 3, 7, 14],
    isActive: true
  }
];

// サンプルケア記録データ
const sampleCareRecords: CareRecord[] = [
  {
    id: '1',
    catId: 'c1',
    catName: 'レオ',
    type: 'ワクチン',
    date: '2025-08-03',
    description: '3種混合ワクチン接種',
    nextDate: '2026-08-03',
    status: '完了',
    veterinarian: '田中獣医師',
    notes: '副反応なし、経過良好',
    tags: [
      { id: 't1', name: '左肩甲骨', category: 'body_part', color: 'blue' },
      { id: 't2', name: '3種混合', category: 'treatment', color: 'green' }
    ]
  },
  {
    id: '2',
    catId: 'c2',
    catName: 'ルナ',
    type: '健康診断',
    date: '2025-08-05',
    description: '定期健康診断',
    nextDate: '2025-11-05',
    status: '予定',
    veterinarian: '佐藤獣医師',
    tags: [
      { id: 't3', name: '全身検査', category: 'treatment', color: 'green' }
    ]
  },
  {
    id: '3',
    catId: 'c3',
    catName: 'ミケ',
    type: '駆虫',
    date: '2025-07-28',
    description: '内部寄生虫駆除薬投与',
    nextDate: '2025-08-28',
    status: '遅延',
    notes: '投与予定日を過ぎています',
    tags: [
      { id: 't4', name: '消化器系', category: 'body_part', color: 'blue' },
      { id: 't5', name: '駆虫薬', category: 'medication', color: 'purple' }
    ]
  },
  {
    id: '4',
    catId: 'c1',
    catName: 'レオ',
    type: '体重測定',
    date: '2025-08-01',
    description: '定期体重測定: 4.2kg',
    nextDate: '2025-08-15',
    status: '完了',
    tags: [
      { id: 't6', name: '体重管理', category: 'general', color: 'gray' }
    ]
  },
  {
    id: '5',
    catId: 'c4',
    catName: 'シロ',
    type: 'ワクチン',
    date: '2025-08-10',
    description: '子猫用ワクチン（2回目）',
    nextDate: '2025-09-10',
    status: '予定',
    veterinarian: '田中獣医師',
    tags: [
      { id: 't7', name: '右肩甲骨', category: 'body_part', color: 'blue' },
      { id: 't8', name: '子猫ワクチン', category: 'treatment', color: 'green' }
    ]
  }
];

// サンプルタグカテゴリデータ
const sampleTagCategories: TagCategory[] = [
  {
    id: 'body_part',
    name: '部位',
    description: '体の部位や臓器を指定',
    color: 'blue',
    order: 1
  },
  {
    id: 'symptom',
    name: '症状',
    description: '観察された症状',
    color: 'red',
    order: 2
  },
  {
    id: 'treatment',
    name: '治療・処置',
    description: '実施した治療や処置',
    color: 'green',
    order: 3
  },
  {
    id: 'medication',
    name: '薬剤',
    description: '使用した薬剤や医療材料',
    color: 'purple',
    order: 4
  },
  {
    id: 'general',
    name: '一般',
    description: 'その他の汎用タグ',
    color: 'gray',
    order: 5
  }
];

// サンプル利用可能タグデータ
const sampleAvailableTags: CareTag[] = [
  // 部位タグ
  { id: 'bp1', name: '右目', category: 'body_part', color: 'blue' },
  { id: 'bp2', name: '左目', category: 'body_part', color: 'blue' },
  { id: 'bp3', name: '両目', category: 'body_part', color: 'blue' },
  { id: 'bp4', name: '右耳', category: 'body_part', color: 'blue' },
  { id: 'bp5', name: '左耳', category: 'body_part', color: 'blue' },
  { id: 'bp6', name: '両耳', category: 'body_part', color: 'blue' },
  { id: 'bp7', name: '鼻', category: 'body_part', color: 'blue' },
  { id: 'bp8', name: '口・歯', category: 'body_part', color: 'blue' },
  { id: 'bp9', name: '喉', category: 'body_part', color: 'blue' },
  { id: 'bp10', name: '首', category: 'body_part', color: 'blue' },
  { id: 'bp11', name: '胸部', category: 'body_part', color: 'blue' },
  { id: 'bp12', name: '腹部', category: 'body_part', color: 'blue' },
  { id: 'bp13', name: '前足', category: 'body_part', color: 'blue' },
  { id: 'bp14', name: '後足', category: 'body_part', color: 'blue' },
  { id: 'bp15', name: '背中', category: 'body_part', color: 'blue' },
  { id: 'bp16', name: '尻尾', category: 'body_part', color: 'blue' },
  { id: 'bp17', name: '肛門周辺', category: 'body_part', color: 'blue' },
  { id: 'bp18', name: '生殖器', category: 'body_part', color: 'blue' },
  
  // 症状タグ
  { id: 'sy1', name: '鼻水', category: 'symptom', color: 'red' },
  { id: 'sy2', name: '目やに', category: 'symptom', color: 'red' },
  { id: 'sy3', name: '涙目', category: 'symptom', color: 'red' },
  { id: 'sy4', name: '目の赤み', category: 'symptom', color: 'red' },
  { id: 'sy5', name: '目の腫れ', category: 'symptom', color: 'red' },
  { id: 'sy6', name: 'くしゃみ', category: 'symptom', color: 'red' },
  { id: 'sy7', name: '咳', category: 'symptom', color: 'red' },
  { id: 'sy8', name: '呼吸困難', category: 'symptom', color: 'red' },
  { id: 'sy9', name: '食欲不振', category: 'symptom', color: 'red' },
  { id: 'sy10', name: '嘔吐', category: 'symptom', color: 'red' },
  { id: 'sy11', name: '下痢', category: 'symptom', color: 'red' },
  { id: 'sy12', name: '便秘', category: 'symptom', color: 'red' },
  { id: 'sy13', name: '排泄障害', category: 'symptom', color: 'red' },
  { id: 'sy14', name: '発熱', category: 'symptom', color: 'red' },
  { id: 'sy15', name: '体重減少', category: 'symptom', color: 'red' },
  { id: 'sy16', name: '元気消失', category: 'symptom', color: 'red' },
  { id: 'sy17', name: '痛み反応', category: 'symptom', color: 'red' },
  { id: 'sy18', name: '皮膚の異常', category: 'symptom', color: 'red' },
  { id: 'sy19', name: 'かゆみ', category: 'symptom', color: 'red' },
  
  // 治療タグ
  { id: 'tr1', name: '投薬', category: 'treatment', color: 'green' },
  { id: 'tr2', name: '注射', category: 'treatment', color: 'green' },
  { id: 'tr3', name: '点滴', category: 'treatment', color: 'green' },
  { id: 'tr4', name: '外用薬', category: 'treatment', color: 'green' },
  { id: 'tr5', name: '手術', category: 'treatment', color: 'green' },
  { id: 'tr6', name: '検査', category: 'treatment', color: 'green' },
  { id: 'tr7', name: '経過観察', category: 'treatment', color: 'green' },
  
  // 薬剤タグ
  { id: 'md1', name: '抗生物質', category: 'medication', color: 'purple' },
  { id: 'md2', name: '抗炎症薬', category: 'medication', color: 'purple' },
  { id: 'md3', name: '点眼薬', category: 'medication', color: 'purple' },
  { id: 'md4', name: '軟膏', category: 'medication', color: 'purple' },
  { id: 'md5', name: 'ワクチン', category: 'medication', color: 'purple' },
  { id: 'md6', name: '駆虫薬', category: 'medication', color: 'purple' }
];

// サンプルケアカテゴリデータ
const sampleCareCategories: CareCategory[] = [
  {
    id: '1',
    name: '日常ケア',
    description: '毎日〜週単位で行う基本的なケア',
    color: 'blue',
    icon: 'IconCalendar',
    order: 1
  },
  {
    id: '2',
    name: '健康管理',
    description: '定期的な健康チェックと予防医療',
    color: 'green',
    icon: 'IconShield',
    order: 2
  },
  {
    id: '3',
    name: '病気・治療',
    description: '疾患の治療と経過観察',
    color: 'red',
    icon: 'IconPill',
    order: 3
  },
  {
    id: '4',
    name: '繁殖関連',
    description: '交配、妊娠、出産に関するケア',
    color: 'pink',
    icon: 'IconWeight',
    order: 4
  }
];

// サンプルケア項目データ
const sampleCareItems: CareItem[] = [
  // 日常ケア
  {
    id: '1',
    categoryId: '1',
    name: 'グルーミング',
    description: 'ブラッシング、爪切り、耳掃除',
    defaultInterval: 7,
    priority: '中',
    isRecurring: true,
    recordTemplate: {
      requiredFields: ['実施内容'],
      optionalFields: ['特記事項'],
      numericFields: [],
      selectFields: [{ name: '部位', options: ['全身', '頭部', '胴体', '足', '尻尾', '爪', '耳', '目', '口'] }],
      textFields: ['気づいたこと']
    },
    alertDays: 1,
    order: 1
  },
  {
    id: '2',
    categoryId: '1',
    name: '体重測定',
    description: '定期的な体重チェック',
    defaultInterval: 14,
    priority: '中',
    isRecurring: true,
    recordTemplate: {
      requiredFields: ['体重'],
      optionalFields: [],
      numericFields: [{ name: '体重', unit: 'kg', min: 0, max: 15 }],
      selectFields: [],
      textFields: ['体調の変化']
    },
    alertDays: 2,
    order: 2
  },
  // 健康管理
  {
    id: '3',
    categoryId: '2',
    name: 'ワクチン接種',
    description: '各種ワクチンの接種',
    defaultInterval: 365,
    priority: '高',
    isRecurring: true,
    recordTemplate: {
      requiredFields: ['ワクチン名', '接種部位'],
      optionalFields: ['ロット番号', '副反応'],
      numericFields: [],
      selectFields: [
        { name: 'ワクチン名', options: ['3種混合', '5種混合', '7種混合', '猫白血病', 'その他'] },
        { name: '接種部位', options: ['左肩甲骨間', '右肩甲骨間', '左後肢', '右後肢'] }
      ],
      textFields: ['副反応の詳細', '次回予定']
    },
    alertDays: 14,
    order: 1
  },
  // 病気・治療
  {
    id: '4',
    categoryId: '3',
    name: '投薬管理',
    description: '処方薬の投与記録',
    priority: '高',
    isRecurring: false,
    recordTemplate: {
      requiredFields: ['薬剤名', '投与量', '投与方法'],
      optionalFields: ['効果', '副作用'],
      numericFields: [
        { name: '投与量', unit: 'ml', min: 0, max: 100 },
        { name: '体温', unit: '℃', min: 35, max: 42 }
      ],
      selectFields: [
        { name: '投与方法', options: ['経口', '注射', '点滴', '外用', 'その他'] },
        { name: '効果', options: ['著効', '有効', '軽度改善', '無効', '悪化'] }
      ],
      textFields: ['症状の変化', '副作用の詳細']
    },
    order: 1
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case '完了': return 'green';
    case '予定': return 'blue';
    case '遅延': return 'red';
    default: return 'gray';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'ワクチン': return <IconShield size={16} />;
    case '駆虫': return <IconPill size={16} />;
    case '健康診断': return <IconCalendar size={16} />;
    case '体重測定': return <IconWeight size={16} />;
    default: return <IconEdit size={16} />;
  }
};

export default function CarePage() {
  const [careRecords, _setCareRecords] = useState<CareRecord[]>(sampleCareRecords);
  const [careCategories, setCareCategories] = useState<CareCategory[]>(sampleCareCategories);
  const [careItems, setCareItems] = useState<CareItem[]>(sampleCareItems);
  const [tagCategories, _setTagCategories] = useState<TagCategory[]>(sampleTagCategories);
  const [availableTags, _setAvailableTags] = useState<CareTag[]>(sampleAvailableTags);
  const [medicalTemplates, setMedicalTemplates] = useState<MedicalTemplate[]>(sampleMedicalTemplates);
  const [opened, { open, close }] = useDisclosure(false);
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false);
  const [itemModalOpened, { open: openItemModal, close: closeItemModal }] = useDisclosure(false);
  const [tagModalOpened, { open: openTagModal, close: closeTagModal }] = useDisclosure(false);
  const [templateModalOpened, { open: openTemplateModal, close: closeTemplateModal }] = useDisclosure(false);
  const [activeTab, setActiveTab] = useState<string>('today');
  const [editingCategory, setEditingCategory] = useState<CareCategory | null>(null);
  const [editingItem, setEditingItem] = useState<CareItem | null>(null);
  const [editingTag, setEditingTag] = useState<CareTag | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MedicalTemplate | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // 簡単記録フォーム用の状態
  const [quickRecordStep, setQuickRecordStep] = useState<number>(1);
  const [quickRecordData, setQuickRecordData] = useState({
    catId: '',
    catName: '',
    type: '',
    date: new Date(),
    description: '',
    tags: [] as string[]
  });

  // 治療記録用の状態
  const [treatmentRecordModalOpened, { open: openTreatmentRecordModal, close: closeTreatmentRecordModal }] = useDisclosure(false);
  const [treatmentTemplateSettings, setTreatmentTemplateSettings] = useState<TreatmentTemplateSettings>(defaultTreatmentTemplateSettings);
  const [diseaseHistory, _setDiseaseHistory] = useState<string[]>(sampleDiseaseHistory);

  // タグ選択用のデータを生成（Mantine v8対応）
  const getTagSelectData = useCallback(() => {
    try {
      if (!availableTags || !Array.isArray(availableTags)) {
        console.warn('availableTags is not available or not an array');
        return [];
      }
      
      if (!tagCategories || !Array.isArray(tagCategories)) {
        // カテゴリがない場合は単純なvalue/label配列を返す
        return availableTags.map(tag => ({
          value: tag.id,
          label: tag.name
        }));
      }
      
      // Mantine v8の形式でvalue/labelオブジェクトの配列を返す
      const sortedTags = [...availableTags].sort((a, b) => {
        const catA = tagCategories.find(cat => cat.id === a.category);
        const catB = tagCategories.find(cat => cat.id === b.category);
        const categoryOrderA = catA?.order || 999;
        const categoryOrderB = catB?.order || 999;
        
        if (categoryOrderA !== categoryOrderB) {
          return categoryOrderA - categoryOrderB;
        }
        
        return a.name.localeCompare(b.name);
      });
      
      return sortedTags.map(tag => ({
        value: tag.id,
        label: tag.name
      }));
    } catch (error) {
      console.error('Error in getTagSelectData:', error);
      return [];
    }
  }, [availableTags, tagCategories]);

  // データの初期化を確認
  useEffect(() => {
    if (careRecords && tagCategories && availableTags) {
      console.log('データ初期化完了:', {
        careRecords: careRecords.length,
        tagCategories: tagCategories.length,
        availableTags: availableTags.length
      });
      setIsDataLoaded(true);
    }
  }, [careRecords, tagCategories, availableTags]);

  // タグデータのテスト
  useEffect(() => {
    if (isDataLoaded) {
      const testData = getTagSelectData();
      console.log('タグ選択データ:', testData.slice(0, 3)); // 最初の3つをログ出力
    }
  }, [isDataLoaded, getTagSelectData]);

  // 今日の予定を取得
  const getTodayCare = () => {
    const today = new Date().toISOString().split('T')[0];
    return careRecords.filter(record => record.date === today || record.nextDate === today);
  };

  // 遅延中のケアを取得
  const getOverdueCare = () => {
    const today = new Date().toISOString().split('T')[0];
    return careRecords.filter(record => 
      record.nextDate && record.nextDate < today && record.status !== '完了'
    );
  };

  // 今週の予定を取得
  const getWeekCare = () => {
    const today = new Date();
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];
    const weekLaterStr = weekLater.toISOString().split('T')[0];
    
    return careRecords.filter(record => 
      (record.date >= todayStr && record.date <= weekLaterStr) ||
      (record.nextDate && record.nextDate >= todayStr && record.nextDate <= weekLaterStr)
    );
  };

  // カテゴリの操作
  const handleCategoryEdit = (category: CareCategory) => {
    setEditingCategory(category);
    openCategoryModal();
  };

  const handleCategoryAdd = () => {
    setEditingCategory(null);
    openCategoryModal();
  };

  const handleCategoryDelete = (categoryId: string) => {
    setCareCategories(prev => prev.filter(c => c.id !== categoryId));
    setCareItems(prev => prev.filter(i => i.categoryId !== categoryId));
  };

  // ケア項目の操作
  const handleItemEdit = (item: CareItem) => {
    setEditingItem(item);
    openItemModal();
  };

  const handleItemAdd = (categoryId: string) => {
    setEditingItem({
      id: '',
      categoryId,
      name: '',
      description: '',
      priority: '中',
      isRecurring: false,
      recordTemplate: {
        requiredFields: [],
        optionalFields: [],
        numericFields: [],
        selectFields: [],
        textFields: []
      },
      order: 1
    });
    openItemModal();
  };

  const handleItemDelete = (itemId: string) => {
    setCareItems(prev => prev.filter(i => i.id !== itemId));
  };

  // カテゴリ別にケア項目を取得
  const getItemsByCategory = (categoryId: string) => {
    return careItems
      .filter(item => item.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  };

  // タグカテゴリごとにタグを取得
  const getTagsByCategory = (categoryId: string) => {
    return availableTags.filter(tag => tag.category === categoryId);
  };

  // タグ操作のハンドラー
  const handleTagCreate = () => {
    setEditingTag(null);
    openTagModal();
  };

  const handleTagEdit = (tag: CareTag) => {
    setEditingTag(tag);
    openTagModal();
  };

  const handleTagSave = (tagData: { name: string; category: string; color: string }) => {
    if (editingTag) {
      // 編集モード
      const updatedTag = { ...editingTag, ...tagData, category: tagData.category as CareTag['category'] };
      // 実際のアプリでは、ここでAPIコールまたは状態更新
      console.log('タグ更新:', updatedTag);
    } else {
      // 新規作成モード
      const newTag: CareTag = {
        id: `custom_${Date.now()}`,
        ...tagData,
        category: tagData.category as CareTag['category']
      };
      // 実際のアプリでは、ここでAPIコールまたは状態更新
      console.log('タグ作成:', newTag);
    }
    closeTagModal();
  };

  const handleTagDelete = (tagId: string) => {
    // 実際のアプリでは、ここでAPIコールまたは状態更新
    console.log('タグ削除:', tagId);
  };

  // 簡単記録フォーム用のハンドラー
  const openQuickRecord = () => {
    setQuickRecordStep(1);
    setQuickRecordData({
      catId: '',
      catName: '',
      type: '',
      date: new Date(),
      description: '',
      tags: []
    });
    open();
  };

  const handleQuickRecordNext = () => {
    if (quickRecordStep < 3) {
      setQuickRecordStep(quickRecordStep + 1);
    }
  };

  const handleQuickRecordPrev = () => {
    if (quickRecordStep > 1) {
      setQuickRecordStep(quickRecordStep - 1);
    }
  };

  const handleQuickRecordSave = () => {
    // 実際のアプリでは、ここでAPIコールまたは状態更新
    console.log('簡単記録保存:', quickRecordData);
    close();
  };

  // 医療テンプレート操作のハンドラー
  const handleTemplateCreate = () => {
    setEditingTemplate(null);
    openTemplateModal();
  };

  const handleTemplateEdit = (template: MedicalTemplate) => {
    setEditingTemplate(template);
    openTemplateModal();
  };

  const handleTemplateSave = (templateData: Partial<MedicalTemplate>) => {
    if (editingTemplate) {
      // 編集モード
      setMedicalTemplates(prev => 
        prev.map(t => t.id === editingTemplate.id ? { ...editingTemplate, ...templateData } : t)
      );
    } else {
      // 新規作成モード
      const newTemplate: MedicalTemplate = {
        id: `template_${Date.now()}`,
        name: '',
        description: '',
        category: 'disease',
        fields: [],
        suggestedTags: [],
        followUpDays: [],
        isActive: true,
        ...templateData
      };
      setMedicalTemplates(prev => [...prev, newTemplate]);
    }
    closeTemplateModal();
  };

  const handleTemplateDelete = (templateId: string) => {
    setMedicalTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleTemplateToggle = (templateId: string) => {
    setMedicalTemplates(prev =>
      prev.map(t => t.id === templateId ? { ...t, isActive: !t.isActive } : t)
    );
  };

  // タグフィルター機能
  const filterRecordsByTags = (records: CareRecord[], tagIds: string[]) => {
    if (!records || !Array.isArray(records) || tagIds.length === 0) return records;
    return records.filter(record => {
      if (!record.tags || !Array.isArray(record.tags)) return false;
      return tagIds.every(tagId => record.tags.some(tag => tag.id === tagId));
    });
  };

  return (
  <Container size="lg" style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)', padding: '1rem', paddingBottom: '5rem' }}>
      {/* ヘッダー */}
      <Group justify="space-between" mb="lg" wrap="nowrap">
        <Title order={1} c="blue" size="h2">ケアスケジュール</Title>
        <Group gap="sm">
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={openQuickRecord}
            size="sm"
          >
            ケア記録追加
          </Button>
          <Button 
            leftSection={<Text size="sm">🏥</Text>} 
            onClick={openTreatmentRecordModal}
            size="sm"
            variant="outline"
          >
            治療記録追加
          </Button>
        </Group>
      </Group>

      {/* サマリーカード */}
      <Group grow mb="lg">
        <Card padding="md" bg="red.0" radius="md">
          <Group gap="xs">
            <Text size="xl" c="red">⚠️</Text>
            <Box>
              <Text size="lg" fw={700} c="red">{getOverdueCare().length}</Text>
              <Text size="sm" c="dimmed">遅延中</Text>
            </Box>
          </Group>
        </Card>
        <Card padding="md" bg="blue.0" radius="md">
          <Group gap="xs">
            <Text size="xl" c="blue">📅</Text>
            <Box>
              <Text size="lg" fw={700} c="blue">{getTodayCare().length}</Text>
              <Text size="sm" c="dimmed">本日予定</Text>
            </Box>
          </Group>
        </Card>
        <Card padding="md" bg="green.0" radius="md">
          <Group gap="xs">
            <Text size="xl" c="green">📊</Text>
            <Box>
              <Text size="lg" fw={700} c="green">{getWeekCare().length}</Text>
              <Text size="sm" c="dimmed">今週予定</Text>
            </Box>
          </Group>
        </Card>
      </Group>

      {/* タグフィルター */}
      {isDataLoaded && (
        <Card padding="md" mb="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>症状・部位からの検索</Text>
            {selectedTags.length > 0 && (
              <Button size="xs" variant="subtle" onClick={() => setSelectedTags([])}>
                クリア
              </Button>
            )}
          </Group>
          <MultiSelect
            placeholder="症状や部位でフィルタリング（複数選択可）"
            data={isDataLoaded ? getTagSelectData() : []}
            value={selectedTags}
            onChange={setSelectedTags}
            searchable
            clearable
            size="sm"
          />
          {selectedTags.length > 0 && (
            <Text size="xs" c="dimmed" mt="xs">
              {filterRecordsByTags(careRecords, selectedTags).length}件の記録が見つかりました
            </Text>
          )}
        </Card>
      )}

      {/* タブ */}
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'today')} variant="outline" mb="md">
        <Tabs.List grow>
          <Tabs.Tab value="today" leftSection={<IconCalendar size={14} />}>
            本日
          </Tabs.Tab>
          <Tabs.Tab value="overdue" leftSection={<Text size="sm">⚠️</Text>}>
            遅延中
          </Tabs.Tab>
          <Tabs.Tab value="week" leftSection={<Text size="sm">📊</Text>}>
            今週
          </Tabs.Tab>
          <Tabs.Tab value="all" leftSection={<IconEdit size={14} />}>
            全記録
          </Tabs.Tab>
          <Tabs.Tab value="management" leftSection={<IconSettings size={14} />}>
            項目管理
          </Tabs.Tab>
          <Tabs.Tab value="tags" leftSection={<IconPill size={14} />}>
            タグ管理
          </Tabs.Tab>
          <Tabs.Tab value="templates" leftSection={<Text size="sm">📋</Text>}>
            テンプレート
          </Tabs.Tab>
        </Tabs.List>

        {/* 本日のケア */}
        <Tabs.Panel value="today" pt="md">
          <Stack gap="md">
            {filterRecordsByTags(getTodayCare(), selectedTags).length === 0 ? (
              <Card padding="lg" bg="gray.0" radius="md">
                <Text ta="center" c="dimmed">
                  {selectedTags.length > 0 ? 'フィルタ条件に一致する記録がありません' : '本日のケア予定はありません'}
                </Text>
              </Card>
            ) : (
              filterRecordsByTags(getTodayCare(), selectedTags).map((record) => (
                <Card key={record.id} shadow="sm" padding="md" radius="md" withBorder>
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="md">
                      {getTypeIcon(record.type)}
                      <Box>
                        <Text fw={500}>{record.catName}</Text>
                        <Text size="sm" c="dimmed">{record.description}</Text>
                        {record.veterinarian && (
                          <Text size="xs" c="blue">担当: {record.veterinarian}</Text>
                        )}
                        {/* タグ表示 */}
                        {record.tags.length > 0 && (
                          <Group gap="xs" mt="xs">
                            {record.tags.map((tag) => (
                              <Pill key={tag.id} size="xs" c={tag.color}>
                                {tag.name}
                              </Pill>
                            ))}
                          </Group>
                        )}
                      </Box>
                    </Group>
                    <Group gap="xs">
                      <Badge size="sm" color={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                      <ActionIcon variant="subtle" size="sm">
                        <IconEdit size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))
            )}
          </Stack>
        </Tabs.Panel>

        {/* 遅延中のケア */}
        <Tabs.Panel value="overdue" pt="md">
          <Stack gap="md">
            {getOverdueCare().length === 0 ? (
              <Card padding="lg" bg="green.0" radius="md">
                <Text ta="center" c="green">遅延中のケアはありません</Text>
              </Card>
            ) : (
              getOverdueCare().map((record) => (
                <Card key={record.id} shadow="sm" padding="md" radius="md" withBorder bg="red.0">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="md">
                      {getTypeIcon(record.type)}
                      <Box>
                        <Text fw={500}>{record.catName}</Text>
                        <Text size="sm" c="dimmed">{record.description}</Text>
                        <Text size="xs" c="red">予定日: {record.nextDate}</Text>
                        {record.notes && (
                          <Text size="xs" c="orange">{record.notes}</Text>
                        )}
                      </Box>
                    </Group>
                    <Group gap="xs">
                      <Badge size="sm" color="red">
                        遅延中
                      </Badge>
                      <ActionIcon variant="subtle" size="sm">
                        <IconEdit size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))
            )}
          </Stack>
        </Tabs.Panel>

        {/* 今週の予定 */}
        <Tabs.Panel value="week" pt="md">
          <Stack gap="md">
            {getWeekCare().map((record) => (
              <Card key={record.id} shadow="sm" padding="md" radius="md" withBorder>
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="md">
                    {getTypeIcon(record.type)}
                    <Box>
                      <Text fw={500}>{record.catName}</Text>
                      <Text size="sm" c="dimmed">{record.description}</Text>
                      <Text size="xs" c="blue">
                        {record.status === '完了' ? `実施日: ${record.date}` : `予定日: ${record.nextDate || record.date}`}
                      </Text>
                    </Box>
                  </Group>
                  <Group gap="xs">
                    <Badge size="sm" color={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                    <ActionIcon variant="subtle" size="sm">
                      <IconEdit size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </Tabs.Panel>

        {/* 全記録 */}
        <Tabs.Panel value="all" pt="md">
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <ScrollArea>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>猫名</Table.Th>
                    <Table.Th>ケア種類</Table.Th>
                    <Table.Th>実施日</Table.Th>
                    <Table.Th>次回予定</Table.Th>
                    <Table.Th>状態</Table.Th>
                    <Table.Th>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {careRecords.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>
                        <Text fw={500}>{record.catName}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {getTypeIcon(record.type)}
                          <Text size="sm">{record.type}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>{record.date}</Table.Td>
                      <Table.Td>{record.nextDate || '-'}</Table.Td>
                      <Table.Td>
                        <Badge size="sm" color={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon variant="subtle" size="sm">
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
        </Tabs.Panel>

        {/* 項目管理 */}
        <Tabs.Panel value="management" pt="md">
          <Stack gap="lg">
            {/* カテゴリ管理ヘッダー */}
            <Group justify="space-between">
              <Title order={3}>ケア項目管理</Title>
              <Button 
                leftSection={<IconPlus size={16} />} 
                onClick={handleCategoryAdd}
                variant="light"
                size="sm"
              >
                カテゴリ追加
              </Button>
            </Group>

            {/* カテゴリ別項目表示 */}
            {careCategories
              .sort((a, b) => a.order - b.order)
              .map((category) => (
                <Card key={category.id} shadow="sm" padding="lg" radius="md" withBorder>
                  {/* カテゴリヘッダー */}
                  <Group justify="space-between" mb="md">
                    <Group gap="sm">
                      <Box 
                        style={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: `var(--mantine-color-${category.color}-5)` 
                        }} 
                      />
                      <Box>
                        <Text fw={600} size="lg">{category.name}</Text>
                        <Text size="sm" c="dimmed">{category.description}</Text>
                      </Box>
                    </Group>
                    <Group gap="xs">
                      <Button 
                        leftSection={<IconPlus size={14} />} 
                        onClick={() => handleItemAdd(category.id)}
                        variant="outline"
                        size="xs"
                      >
                        項目追加
                      </Button>
                      <ActionIcon 
                        variant="subtle" 
                        onClick={() => handleCategoryEdit(category)}
                        size="sm"
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="subtle" 
                        color="red"
                        onClick={() => handleCategoryDelete(category.id)}
                        size="sm"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  {/* ケア項目一覧 */}
                  <Stack gap="sm" pl="md">
                    {getItemsByCategory(category.id).map((item) => (
                      <Card key={item.id} shadow="xs" padding="sm" radius="sm" withBorder={false} bg="gray.0">
                        <Group justify="space-between">
                          <Group gap="sm" style={{ flex: 1 }}>
                            <ActionIcon variant="subtle" size="sm" style={{ cursor: 'grab' }}>
                              <IconGripVertical size={12} />
                            </ActionIcon>
                                                       <Box style={{ flex: 1 }}>
                              <Group gap="sm" mb="xs">
                                <Text size="sm" fw={500}>{item.name}</Text>
                                <Badge size="xs" color={item.priority === '高' ? 'red' : item.priority === '中' ? 'yellow' : 'green'}>
                                  {item.priority}
                                </Badge>
                                {item.isRecurring && (
                                  <Badge size="xs" variant="light" color="blue">
                                    定期
                                  </Badge>
                                )}
                                {item.defaultInterval && (
                                  <Badge size="xs" variant="outline" color="gray">
                                    {item.defaultInterval}日間隔
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed">{item.description}</Text>
                            </Box>
                          </Group>
                          <Group gap="xs">
                            <ActionIcon 
                              variant="subtle" 
                              onClick={() => handleItemEdit(item)}
                              size="sm"
                            >
                              <IconEdit size={12} />
                            </ActionIcon>
                            <ActionIcon 
                              variant="subtle" 
                              color="red"
                              onClick={() => handleItemDelete(item.id)}
                              size="sm"
                            >
                              <IconTrash size={12} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Card>
                    ))}
                    
                    {getItemsByCategory(category.id).length === 0 && (
                      <Text size="sm" c="dimmed" ta="center" py="sm">
                        この カテゴリには項目がありません
                      </Text>
                    )}
                  </Stack>
                </Card>
              ))}
          </Stack>
        </Tabs.Panel>

        {/* タグ管理 */}
        <Tabs.Panel value="tags" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>ケアタグ管理</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={handleTagCreate}>
                新規タグ作成
              </Button>
            </Group>

            {/* カテゴリごとのタグ表示 */}
            {tagCategories.map((category) => (
              <Card key={category.id} shadow="sm" padding="md" radius="md" withBorder>
                <Group justify="space-between" mb="sm">
                  <Badge color={category.color} variant="light" size="lg">
                    {category.name} ({getTagsByCategory(category.id).length})
                  </Badge>
                </Group>
                
                <Stack gap="xs">
                  {getTagsByCategory(category.id).map((tag) => (
                    <Group key={tag.id} justify="space-between" p="xs" bg="gray.0" style={{ borderRadius: '4px' }}>
                      <Group gap="xs">
                        <Pill 
                          bg={tag.color} 
                          size="sm"
                          style={{ color: 'white' }}
                        >
                          {tag.name}
                        </Pill>
                      </Group>
                      <Group gap="xs">
                        <ActionIcon 
                          size="sm" 
                          variant="light" 
                          color="blue"
                          onClick={() => handleTagEdit(tag)}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon 
                          size="sm" 
                          variant="light" 
                          color="red"
                          onClick={() => handleTagDelete(tag.id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  ))}
                  
                  {getTagsByCategory(category.id).length === 0 && (
                    <Text size="sm" c="dimmed" ta="center" py="sm">
                      このカテゴリにはタグがありません
                    </Text>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        </Tabs.Panel>

        {/* 医療テンプレート管理 */}
        <Tabs.Panel value="templates" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>医療記録テンプレート</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={handleTemplateCreate}>
                新規テンプレート作成
              </Button>
            </Group>

            {/* カテゴリごとのテンプレート表示 */}
            {['disease', 'treatment', 'medication', 'examination'].map((category) => {
              const categoryTemplates = medicalTemplates.filter(t => t.category === category);
              const categoryName = {
                disease: '病気・疾患',
                treatment: '治療・処置',
                medication: '薬物療法',
                examination: '検査'
              }[category];

              return (
                <Card key={category} shadow="sm" padding="md" radius="md" withBorder>
                  <Group justify="space-between" mb="sm">
                    <Badge 
                      color={category === 'disease' ? 'red' : category === 'treatment' ? 'green' : category === 'medication' ? 'purple' : 'blue'} 
                      variant="light" 
                      size="lg"
                    >
                      {categoryName} ({categoryTemplates.length})
                    </Badge>
                  </Group>
                  
                  <Stack gap="xs">
                    {categoryTemplates.map((template) => (
                      <Group key={template.id} justify="space-between" p="sm" bg="gray.0" style={{ borderRadius: '4px' }}>
                        <Box>
                          <Group gap="xs" mb="xs">
                            <Text fw={500} size="sm">{template.name}</Text>
                            <Badge 
                              color={template.isActive ? 'green' : 'gray'} 
                              size="xs" 
                              variant="dot"
                            >
                              {template.isActive ? '有効' : '無効'}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed" mb="xs">
                            {template.description}
                          </Text>
                          <Group gap="xs">
                            <Text size="xs" c="dimmed">
                              項目数: {template.fields.length}
                            </Text>
                            <Text size="xs" c="dimmed">
                              推奨タグ: {template.suggestedTags.length}個
                            </Text>
                            <Text size="xs" c="dimmed">
                              経過観察: {template.followUpDays.join(', ')}日
                            </Text>
                          </Group>
                        </Box>
                        <Group gap="xs">
                          <ActionIcon 
                            size="sm" 
                            variant="light" 
                            color={template.isActive ? 'orange' : 'green'}
                            onClick={() => handleTemplateToggle(template.id)}
                          >
                            {template.isActive ? '⏸️' : '▶️'}
                          </ActionIcon>
                          <ActionIcon 
                            size="sm" 
                            variant="light" 
                            color="blue"
                            onClick={() => handleTemplateEdit(template)}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon 
                            size="sm" 
                            variant="light" 
                            color="red"
                            onClick={() => handleTemplateDelete(template.id)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    ))}
                    
                    {categoryTemplates.length === 0 && (
                      <Text size="sm" c="dimmed" ta="center" py="sm">
                        このカテゴリにはテンプレートがありません
                      </Text>
                    )}
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* ケア記録追加モーダル（3ステップウィザード） */}
      <Modal opened={opened} onClose={close} title={`ケア記録追加 - ステップ${quickRecordStep}/3`} size="md">
        <QuickRecordWizard
          step={quickRecordStep}
          data={quickRecordData}
          setData={setQuickRecordData}
          onNext={handleQuickRecordNext}
          onPrev={handleQuickRecordPrev}
          onSave={handleQuickRecordSave}
          onCancel={close}
          availableTags={availableTags}
          tagCategories={tagCategories}
          isDataLoaded={isDataLoaded}
        />
      </Modal>

      {/* カテゴリ編集モーダル */}
      <Modal 
        opened={categoryModalOpened} 
        onClose={closeCategoryModal} 
        title={editingCategory ? 'カテゴリ編集' : 'カテゴリ追加'} 
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="カテゴリ名"
            placeholder="カテゴリ名を入力"
            defaultValue={editingCategory?.name || ''}
          />
          <Textarea
            label="説明"
            placeholder="カテゴリの説明を入力"
            defaultValue={editingCategory?.description || ''}
            rows={2}
          />
          <Select
            label="カテゴリ色"
            placeholder="表示色を選択"
            defaultValue={editingCategory?.color || 'blue'}
            data={[
              { value: 'blue', label: 'ブルー' },
              { value: 'green', label: 'グリーン' },
              { value: 'red', label: 'レッド' },
              { value: 'pink', label: 'ピンク' },
              { value: 'yellow', label: 'イエロー' },
              { value: 'violet', label: 'バイオレット' },
              { value: 'orange', label: 'オレンジ' },
              { value: 'teal', label: 'ティール' },
            ]}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeCategoryModal}>
              キャンセル
            </Button>
            <Button onClick={closeCategoryModal}>
              {editingCategory ? '更新' : '追加'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ケア項目編集モーダル */}
      <Modal 
        opened={itemModalOpened} 
        onClose={closeItemModal} 
        title={editingItem?.id ? 'ケア項目編集' : 'ケア項目追加'} 
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="項目名"
            placeholder="ケア項目名を入力"
            defaultValue={editingItem?.name || ''}
          />
          <Textarea
            label="説明"
            placeholder="ケア項目の説明を入力"
            defaultValue={editingItem?.description || ''}
            rows={2}
          />
          <Group grow>
            <Select
              label="優先度"
              defaultValue={editingItem?.priority || '中'}
              data={[
                { value: '高', label: '高' },
                { value: '中', label: '中' },
                { value: '低', label: '低' },
              ]}
            />
            <TextInput
              label="実施間隔（日）"
              placeholder="定期実施の場合の間隔"
              type="number"
              defaultValue={editingItem?.defaultInterval?.toString() || ''}
            />
          </Group>
          <Group>
            <Checkbox
              label="定期実施項目"
              defaultChecked={editingItem?.isRecurring || false}
            />
            <TextInput
              label="アラート（日前）"
              placeholder="何日前に通知するか"
              type="number"
              defaultValue={editingItem?.alertDays?.toString() || ''}
            />
          </Group>
          
          {/* 記録テンプレート設定 */}
          <Box>
            <Text size="sm" fw={500} mb="xs">記録項目テンプレート</Text>
            <Stack gap="xs">
              <TextInput
                label="必須項目（カンマ区切り）"
                placeholder="例：体重,体温,症状"
                defaultValue={editingItem?.recordTemplate.requiredFields.join(',') || ''}
              />
              <TextInput
                label="数値項目（例：体重:kg:0:20）"
                placeholder="項目名:単位:最小値:最大値"
              />
              <TextInput
                label="選択項目（例：症状:軽度,中程度,重度）"
                placeholder="項目名:選択肢1,選択肢2,選択肢3"
              />
            </Stack>
          </Box>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeItemModal}>
              キャンセル
            </Button>
            <Button onClick={closeItemModal}>
              {editingItem?.id ? '更新' : '追加'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* タグ作成・編集モーダル */}
      <Modal opened={tagModalOpened} onClose={closeTagModal} title={editingTag ? 'タグ編集' : 'タグ作成'} size="sm">
        <TagFormModal
          initialData={editingTag}
          onSave={handleTagSave}
          onCancel={closeTagModal}
          tagCategories={tagCategories}
        />
      </Modal>

      {/* テンプレート作成・編集モーダル */}
      <Modal opened={templateModalOpened} onClose={closeTemplateModal} title={editingTemplate ? 'テンプレート編集' : 'テンプレート作成'} size="lg">
        <TemplateFormModal
          initialData={editingTemplate}
          onSave={handleTemplateSave}
          onCancel={closeTemplateModal}
          availableTags={availableTags}
          tagCategories={tagCategories}
        />
      </Modal>

      {/* 治療記録追加モーダル */}
      <Modal opened={treatmentRecordModalOpened} onClose={closeTreatmentRecordModal} title="治療記録追加" size="lg">
        <TreatmentRecordForm
          settings={treatmentTemplateSettings}
          onSettingsChange={setTreatmentTemplateSettings}
          diseaseHistory={diseaseHistory}
          availableTags={availableTags}
          tagCategories={tagCategories}
          treatmentResultOptions={treatmentResultOptions}
          onSave={(data) => {
            console.log('治療記録保存:', data);
            closeTreatmentRecordModal();
          }}
          onCancel={closeTreatmentRecordModal}
        />
      </Modal>
    </Container>
  );
}
