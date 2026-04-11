import React, { useEffect, useState } from 'react';
import '../../../../sass/components/community/modals/EditRulesModal.scss';

const defaultRules = [
    'Be respectful to all members',
    'Keep posts relevant to the category',
    'No spam or self-promotion',
];

export default function EditRulesModal({
    open,
    onCancel,
    onSave,
    rules = [],
}) {
    const [localRules, setLocalRules] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            // Initialize with existing rules or default rules
            setLocalRules(
                rules && rules.length > 0 
                    ? [...rules] 
                    : [...defaultRules]
            );
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open, rules]);

    const handleRuleChange = (index, value) => {
        const updated = [...localRules];
        updated[index] = value;
        setLocalRules(updated);
    };

    const handleRemoveRule = (index) => {
        if (localRules.length > 1) {
            const updated = localRules.filter((_, i) => i !== index);
            setLocalRules(updated);
        }
    };

    const handleAddRule = () => {
        setLocalRules([...localRules, '']);
    };

    const handleSave = async () => {
        // Filter out empty rules before saving
        const validRules = localRules.filter(rule => rule.trim());
        
        setIsSaving(true);
        try {
            await onSave(validRules);
        } finally {
            setIsSaving(false);
        }
    };

    if (!open) return null;

    // Disable save if all rules are empty
    const hasValidRules = localRules.some(rule => rule.trim());

    return (
        <div className="edit-rules-modal-overlay">
            <section className="edit-rules-modal">
                <h2 className="edit-rules-modal__title">Edit Community Rules</h2>
                
                <div className="edit-rules-modal__rules-container">
                    {localRules.map((rule, index) => (
                        <div key={index} className="edit-rules-modal__rule-input-wrapper">
                            <div className="edit-rules-modal__rule-number">{index + 1}</div>
                            <input
                                type="text"
                                value={rule}
                                onChange={(e) => handleRuleChange(index, e.target.value)}
                                placeholder={`Rule ${index + 1}`}
                                className="edit-rules-modal__rule-input"
                            />
                            {localRules.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRule(index)}
                                    className="edit-rules-modal__remove-button"
                                    title="Remove this rule"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleAddRule}
                    className="edit-rules-modal__add-rule-button"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add Rule
                </button>

                <div className="edit-rules-modal__actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="edit-rules-modal__text-button"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!hasValidRules || isSaving}
                        className="edit-rules-modal__primary-button"
                    >
                        {isSaving ? 'Saving...' : 'Save Rules'}
                    </button>
                </div>
            </section>
        </div>
    );
}
