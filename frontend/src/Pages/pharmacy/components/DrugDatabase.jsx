import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  AlertTriangle, 
  Info, 
  Pill,
  Book,
  Shield,
  Activity
} from 'lucide-react';

export default function DrugDatabase({ 
  drugDatabase, 
  loading, 
  onSearchDrug, 
  onGetDrugInfo,
  onCheckInteractions 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [showDrugInfo, setShowDrugInfo] = useState(false);
  const [interactionCheck, setInteractionCheck] = useState('');
  const [interactionResults, setInteractionResults] = useState(null);

  // Filter drugs based on search and category
  const filteredDrugs = useMemo(() => {
    return drugDatabase.filter(drug => {
      const matchesSearch = !searchTerm || 
        drug.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || drug.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [drugDatabase, searchTerm, filterCategory]);

  const handleDrugSelect = async (drug) => {
    setSelectedDrug(drug);
    setShowDrugInfo(true);
    try {
      const detailedInfo = await onGetDrugInfo(drug.drugId);
      setSelectedDrug({ ...drug, ...detailedInfo });
    } catch (error) {
      console.error('Failed to fetch drug details:', error);
    }
  };

  const handleInteractionCheck = async () => {
    if (!interactionCheck.trim()) return;
    
    try {
      const drugs = interactionCheck.split(',').map(d => d.trim());
      const results = await onCheckInteractions(drugs);
      setInteractionResults(results);
    } catch (error) {
      console.error('Failed to check interactions:', error);
    }
  };

  const categories = [
    'all', 'antibiotics', 'analgesics', 'cardiovascular', 'diabetes', 
    'respiratory', 'neurological', 'gastrointestinal', 'hormonal', 'other'
  ];

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'major':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'minor':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading drug database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drug Information Lookup */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-green-600" />
          Drug Information Database
        </h3>
        
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by brand name, generic name, or active ingredient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Drug Interaction Checker */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Drug Interaction Checker
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter drug names (separated by commas)
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={interactionCheck}
                onChange={(e) => setInteractionCheck(e.target.value)}
                placeholder="e.g., Warfarin, Aspirin, Lisinopril"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleInteractionCheck}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Check Interactions
              </button>
            </div>
          </div>
          
          {interactionResults && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Interaction Results:</h4>
              {interactionResults.length > 0 ? (
                <div className="space-y-2">
                  {interactionResults.map((interaction, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(interaction.severity)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{interaction.severity} Interaction</span>
                        <span className="text-xs">{interaction.drugs.join(' + ')}</span>
                      </div>
                      <p className="text-sm">{interaction.description}</p>
                      {interaction.recommendation && (
                        <p className="text-xs mt-1 font-medium">Recommendation: {interaction.recommendation}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-green-600">
                  <Shield className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">No interactions found</p>
                  <p className="text-sm">The checked medications appear to be safe to use together</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drug Database Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Drug Database</h3>
            <span className="text-sm text-gray-600">
              {filteredDrugs.length} of {drugDatabase.length} drugs
            </span>
          </div>
        </div>

        <div className="p-6">
          {filteredDrugs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrugs.map((drug) => (
                <div
                  key={drug.drugId}
                  onClick={() => handleDrugSelect(drug)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Pill className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{drug.brandName}</h4>
                      <p className="text-sm text-gray-600 truncate">{drug.genericName}</p>
                      <p className="text-xs text-gray-500 mt-1">{drug.activeIngredient}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
                          {drug.category}
                        </span>
                        <span className="text-xs text-gray-500">{drug.strength}</span>
                      </div>
                      
                      {drug.warnings && drug.warnings.length > 0 && (
                        <div className="flex items-center mt-2 text-xs text-orange-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          <span>{drug.warnings.length} warning(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Drugs Found</h3>
              <p className="text-gray-600">
                {searchTerm || filterCategory !== 'all'
                  ? "No drugs match your current search criteria."
                  : "Drug database is empty."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Drug Information Modal */}
      {showDrugInfo && selectedDrug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedDrug.brandName}</h2>
                <p className="text-green-100 text-sm">{selectedDrug.genericName}</p>
              </div>
              <button
                onClick={() => setShowDrugInfo(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Basic Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-700">Brand Name</p>
                          <p className="text-gray-900">{selectedDrug.brandName}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Generic Name</p>
                          <p className="text-gray-900">{selectedDrug.genericName}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Active Ingredient</p>
                          <p className="text-gray-900">{selectedDrug.activeIngredient}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Strength</p>
                          <p className="text-gray-900">{selectedDrug.strength}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Category</p>
                          <p className="text-gray-900 capitalize">{selectedDrug.category}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Form</p>
                          <p className="text-gray-900">{selectedDrug.dosageForm}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinical Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Clinical Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    {selectedDrug.indications && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Indications</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {selectedDrug.indications.map((indication, index) => (
                            <li key={index}>{indication}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedDrug.dosage && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Typical Dosage</p>
                        <p className="text-gray-600">{selectedDrug.dosage}</p>
                      </div>
                    )}
                    
                    {selectedDrug.route && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Route of Administration</p>
                        <p className="text-gray-600">{selectedDrug.route}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Warnings and Contraindications */}
              {(selectedDrug.warnings || selectedDrug.contraindications) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                    Warnings & Contraindications
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {selectedDrug.warnings && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Warnings</p>
                        <div className="space-y-2">
                          {selectedDrug.warnings.map((warning, index) => (
                            <div key={index} className="bg-orange-50 border border-orange-200 rounded p-3">
                              <p className="text-orange-800 text-sm">{warning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedDrug.contraindications && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Contraindications</p>
                        <div className="space-y-2">
                          {selectedDrug.contraindications.map((contraindication, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                              <p className="text-red-800 text-sm">{contraindication}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Side Effects */}
              {selectedDrug.sideEffects && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Side Effects</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {selectedDrug.sideEffects.common && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Common</p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {selectedDrug.sideEffects.common.map((effect, index) => (
                            <li key={index}>{effect}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedDrug.sideEffects.serious && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Serious</p>
                        <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                          {selectedDrug.sideEffects.serious.map((effect, index) => (
                            <li key={index}>{effect}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedDrug.sideEffects.rare && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Rare</p>
                        <ul className="list-disc list-inside text-sm text-orange-600 space-y-1">
                          {selectedDrug.sideEffects.rare.map((effect, index) => (
                            <li key={index}>{effect}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDrugInfo(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}