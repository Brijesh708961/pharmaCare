from typing import List, Dict, Optional, Tuple
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VCFParser:
    # Comprehensive variant mapping for 6 target genes
    TARGET_GENES = {
        'CYP2D6': {
            'variants': {
                'rs3892097': {'effect': '*4', 'phenotype': 'Poor Metabolizer'},
                'rs5030655': {'effect': '*5', 'phenotype': 'Poor Metabolizer'},
                'rs1065852': {'effect': '*2', 'phenotype': 'Intermediate Metabolizer'},
                'rs1135840': {'effect': '*10', 'phenotype': 'Intermediate Metabolizer'},
                'rs28371725': {'effect': '*41', 'phenotype': 'Intermediate Metabolizer'},
                'rs35742686': {'effect': 'Duplication', 'phenotype': 'Ultra-Rapid Metabolizer'},
                'rs72549336': {'effect': 'Duplication', 'phenotype': 'Ultra-Rapid Metabolizer'}
            }
        },
        'CYP2C19': {
            'variants': {
                'rs4244285': {'effect': '*2', 'phenotype': 'Poor Metabolizer'},
                'rs4986893': {'effect': '*3', 'phenotype': 'Poor Metabolizer'},
                'rs12248560': {'effect': '*17', 'phenotype': 'Ultra-Rapid Metabolizer'},
                'rs28399504': {'effect': '*4', 'phenotype': 'Poor Metabolizer'},
                'rs72552267': {'effect': '*8', 'phenotype': 'Intermediate Metabolizer'}
            }
        },
        'CYP2C9': {
            'variants': {
                'rs1799853': {'effect': '*2', 'phenotype': 'Intermediate Metabolizer'},
                'rs1057910': {'effect': '*3', 'phenotype': 'Poor Metabolizer'},
                'rs28371686': {'effect': '*5', 'phenotype': 'Poor Metabolizer'},
                'rs9332131': {'effect': '*6', 'phenotype': 'Poor Metabolizer'},
                'rs28371685': {'effect': '*8', 'phenotype': 'Intermediate Metabolizer'},
                'rs7900194': {'effect': '*11', 'phenotype': 'Intermediate Metabolizer'}
            }
        },
        'SLCO1B1': {
            'variants': {
                'rs4149056': {'effect': '*5', 'phenotype': 'Reduced Function'},
                'rs2306283': {'effect': '*1b', 'phenotype': 'Normal Function'},
                'rs11045879': {'effect': '*15', 'phenotype': 'Reduced Function'},
                'rs4149015': {'effect': '*3', 'phenotype': 'Reduced Function'},
                'rs56101265': {'effect': 'Duplication', 'phenotype': 'Reduced Function'}
            }
        },
        'TPMT': {
            'variants': {
                'rs1142345': {'effect': '*3A', 'phenotype': 'Low Activity'},
                'rs1800462': {'effect': '*3C', 'phenotype': 'Low Activity'},
                'rs1800460': {'effect': '*2', 'phenotype': 'Low Activity'},
                'rs1801280': {'effect': '*1S', 'phenotype': 'Intermediate Activity'}
            }
        },
        'DPYD': {
            'variants': {
                'rs3918290': {'effect': '*2A', 'phenotype': 'Deficient'},
                'rs67376798': {'effect': '*13', 'phenotype': 'Deficient'},
                'rs55886062': {'effect': 'HapB3', 'phenotype': 'Reduced Function'},
                'rs56038477': {'effect': '*6', 'phenotype': 'Deficient'},
                'rs75017182': {'effect': 'c.2846A>T', 'phenotype': 'Reduced Function'},
                'rs116855232': {'effect': '*9A', 'phenotype': 'Reduced Function'}
            }
        }
    }
    
    # Phenotype severity mapping
    PHENOTYPE_SEVERITY = {
        'Normal Metabolizer': 1,
        'Normal Function': 1,
        'Intermediate Metabolizer': 2,
        'Intermediate Activity': 2,
        'Reduced Function': 3,
        'Low Activity': 3,
        'Poor Metabolizer': 4,
        'Deficient': 4,
        'Ultra-Rapid Metabolizer': 3
    }
    @staticmethod
    def parse_vcf(content: str) -> Tuple[List[Dict[str, str]], List[str]]:
        """Parse VCF content and return variants and any errors found."""
        variants = []
        errors = []
        
        if not content or not content.strip():
            errors.append("Empty VCF file")
            return variants, errors
            
        lines = content.strip().split('\n')
        header_found = False
        variant_count = 0
        
        for line_num, line in enumerate(lines, 1):
            # Skip header lines
            if line.startswith('#'):
                if line.startswith('#CHROM'):
                    header_found = True
                continue
                
            if not line.strip():
                continue
                
            # Parse variant line
            parts = line.split('\t')
            if len(parts) < 8:
                errors.append(f"Line {line_num}: Invalid VCF format - expected at least 8 columns, got {len(parts)}")
                continue
                
            try:
                variant = {
                    'chrom': parts[0],
                    'pos': parts[1],
                    'id': parts[2] if parts[2] != '.' else '',
                    'ref': parts[3],
                    'alt': parts[4],
                    'qual': parts[5] if parts[5] != '.' else '',
                    'filter': parts[6] if parts[6] != '.' else '',
                    'info': parts[7] if parts[7] != '.' else ''
                }
                variants.append(variant)
                variant_count += 1
            except Exception as e:
                errors.append(f"Line {line_num}: Error parsing variant - {str(e)}")
                
        if not header_found:
            errors.append("No VCF header found (#CHROM line missing)")
            
        if variant_count == 0:
            errors.append("No variants found in VCF file")
            
        logger.info(f"Parsed {variant_count} variants from VCF file")
        return variants, errors

    @staticmethod
    def extract_target_variants(variants: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Extract variants for the 6 target genes with phenotype mapping."""
        target_variants = []
        
        for variant in variants:
            # Extract rsID from ID field or INFO field
            rsid = VCFParser._extract_rsid(variant)
            if not rsid:
                continue
                
            # Check if this rsID is in our target genes
            for gene_name, gene_data in VCFParser.TARGET_GENES.items():
                if rsid in gene_data['variants']:
                    variant_info = gene_data['variants'][rsid]
                    target_variant = {
                        'gene': gene_name,
                        'rsid': rsid,
                        'variant_effect': variant_info['effect'],
                        'phenotype': variant_info['phenotype'],
                        'severity': VCFParser.PHENOTYPE_SEVERITY.get(variant_info['phenotype'], 2),
                        'chrom': variant['chrom'],
                        'pos': variant['pos'],
                        'ref': variant['ref'],
                        'alt': variant['alt'],
                        'quality': variant['qual']
                    }
                    target_variants.append(target_variant)
                    break
                    
        return target_variants
    
    @staticmethod
    def _extract_rsid(variant: Dict[str, str]) -> Optional[str]:
        """Extract rsID from variant ID or INFO field."""
        # First check ID field
        rsid = variant.get('id', '')
        if rsid and rsid.startswith('rs'):
            return rsid
            
        # Then check INFO field for RSID
        info = variant.get('info', '')
        rsid_match = re.search(r'RSID=([^;]+)', info, re.IGNORECASE)
        if rsid_match:
            return rsid_match.group(1)
            
        # Check INFO field for rs pattern
        rs_pattern = re.search(r'(rs\d+)', info)
        if rs_pattern:
            return rs_pattern.group(1)
            
        return None
    
    @staticmethod
    def determine_phenotype(gene_variants: List[Dict[str, str]]) -> Dict[str, str]:
        """Determine overall phenotype for a gene based on all variants."""
        if not gene_variants:
            return {'phenotype': 'Unknown', 'severity': 0}
            
        # Find the highest severity variant
        highest_severity = 0
        primary_phenotype = 'Unknown'
        
        for variant in gene_variants:
            severity = variant.get('severity', 0)
            if severity > highest_severity:
                highest_severity = severity
                primary_phenotype = variant.get('phenotype', 'Unknown')
                
        # Special case: if we have both Poor and Ultra-Rapid, mark as Complex
        phenotypes = [v.get('phenotype', '') for v in gene_variants]
        if 'Poor Metabolizer' in phenotypes and 'Ultra-Rapid Metabolizer' in phenotypes:
            primary_phenotype = 'Complex Metabolizer'
            
        return {
            'phenotype': primary_phenotype,
            'severity': highest_severity,
            'variant_count': len(gene_variants)
        }
    
    @staticmethod
    def get_pharmacogenomic_profile(variants: List[Dict[str, str]]) -> Dict[str, Dict[str, str]]:
        """Generate complete pharmacogenomic profile for all target genes."""
        target_variants = VCFParser.extract_target_variants(variants)
        profile = {}
        
        # Group variants by gene
        gene_variants = {}
        for variant in target_variants:
            gene = variant['gene']
            if gene not in gene_variants:
                gene_variants[gene] = []
            gene_variants[gene].append(variant)
            
        # Determine phenotype for each gene
        for gene, variants_list in gene_variants.items():
            phenotype_info = VCFParser.determine_phenotype(variants_list)
            profile[gene] = {
                'phenotype': phenotype_info['phenotype'],
                'severity': phenotype_info['severity'],
                'variant_count': phenotype_info['variant_count'],
                'variants': variants_list
            }
            
        # Add genes with no variants found
        for gene in VCFParser.TARGET_GENES.keys():
            if gene not in profile:
                profile[gene] = {
                    'phenotype': 'Normal Metabolizer',
                    'severity': 1,
                    'variant_count': 0,
                    'variants': []
                }
                
        return profile

    @staticmethod
    def validate_vcf_structure(content: str) -> Tuple[bool, List[str]]:
        """Validate VCF file structure and return validation results."""
        errors = []
        warnings = []
        
        if not content or not content.strip():
            errors.append("VCF file is empty")
            return False, errors
            
        lines = content.strip().split('\n')
        
        # Check for required header lines
        has_fileformat = False
        has_header = False
        
        for line in lines:
            if line.startswith('##fileformat='):
                has_fileformat = True
            elif line.startswith('#CHROM'):
                has_header = True
                break
                
        if not has_fileformat:
            warnings.append("Missing fileformat header line")
            
        if not has_header:
            errors.append("Missing required #CHROM header line")
            
        # Check variant lines
        variant_lines = [line for line in lines if not line.startswith('#') and line.strip()]
        
        for i, line in enumerate(variant_lines[:5]):  # Check first 5 variants
            parts = line.split('\t')
            if len(parts) < 8:
                errors.append(f"Variant line {i+1} has insufficient columns: {len(parts)} < 8")
                
        is_valid = len(errors) == 0
        return is_valid, errors + warnings
